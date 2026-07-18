import { adminDb } from '@/backend/lib/firebase-admin/config'
import * as admin from 'firebase-admin'
import { Community, CommunityType, CommunityJoinRequest } from '@/shared/types'
import { serializeDocument, serializeSnapshots } from '@/backend/utils/serialize'

const COMMUNITIES_COLLECTION = 'communities'
const USER_COMMUNITIES_COLLECTION = 'userCommunities'
const JOIN_REQUESTS_COLLECTION = 'communityJoinRequests'

export class CommunityRepository {
  private db = adminDb

  // ── Create ────────────────────────────────────────────────
  async createCommunity(
    name: string,
    type: CommunityType,
    city: string,
    college?: string
  ): Promise<Community> {
    const communityRef = this.db.collection(COMMUNITIES_COLLECTION).doc()
    const community: Community = {
      id: communityRef.id,
      name,
      type,
      city,
      college,
      members: 0,
      verified: false,
      createdAt: new Date(),
    }
    await communityRef.set(community)
    return community
  }

  // ── Read ──────────────────────────────────────────────────
  async getAllCommunities(): Promise<Community[]> {
    const snapshot = await this.db
      .collection(COMMUNITIES_COLLECTION)
      .orderBy('members', 'desc')
      .get()
    return serializeSnapshots<Community>(snapshot.docs)
  }

  async getCommunitiesByCity(city: string): Promise<Community[]> {
    const snapshot = await this.db
      .collection(COMMUNITIES_COLLECTION)
      .where('city', '==', city)
      .orderBy('members', 'desc')
      .get()
    return serializeSnapshots<Community>(snapshot.docs)
  }

  async getCommunitiesByType(type: CommunityType): Promise<Community[]> {
    const snapshot = await this.db
      .collection(COMMUNITIES_COLLECTION)
      .where('type', '==', type)
      .orderBy('members', 'desc')
      .get()
    return serializeSnapshots<Community>(snapshot.docs)
  }

  async getCommunityById(id: string): Promise<Community | null> {
    const doc = await this.db.collection(COMMUNITIES_COLLECTION).doc(id).get()
    if (!doc.exists) return null
    return serializeDocument<Community>({ id: doc.id, ...doc.data() })
  }

  // ── Join / Leave ─────────────────────────────────────────
  async joinCommunity(userId: string, communityId: string): Promise<{ queued: boolean }> {
    const existing = await this.db
      .collection(USER_COMMUNITIES_COLLECTION)
      .doc(`${userId}_${communityId}`)
      .get()
    if (existing.exists) return { queued: false } // already a member

    const community = await this.getCommunityById(communityId)
    if (!community) throw new Error('Community not found')

    // If approval required, create a join request instead
    if (community.requiresApproval) {
      await this.createJoinRequest(userId, communityId)
      return { queued: true }
    }

    const batch = this.db.batch()
    const memberRef = this.db.collection(USER_COMMUNITIES_COLLECTION).doc(`${userId}_${communityId}`)
    batch.set(memberRef, { userId, communityId, joinedAt: admin.firestore.FieldValue.serverTimestamp() })
    batch.update(this.db.collection(COMMUNITIES_COLLECTION).doc(communityId), {
      members: admin.firestore.FieldValue.increment(1),
    })
    batch.update(this.db.collection('users').doc(userId), { communityId })
    await batch.commit()
    return { queued: false }
  }

  async leaveCommunity(userId: string, communityId: string): Promise<void> {
    const memberRef = this.db
      .collection(USER_COMMUNITIES_COLLECTION)
      .doc(`${userId}_${communityId}`)

    const existing = await memberRef.get()
    if (!existing.exists) return // not a member

    const batch = this.db.batch()
    batch.delete(memberRef)
    batch.update(this.db.collection(COMMUNITIES_COLLECTION).doc(communityId), {
      members: admin.firestore.FieldValue.increment(-1),
    })
    batch.update(this.db.collection('users').doc(userId), { communityId: admin.firestore.FieldValue.delete() })
    await batch.commit()
  }

  async isMember(userId: string, communityId: string): Promise<boolean> {
    const doc = await this.db
      .collection(USER_COMMUNITIES_COLLECTION)
      .doc(`${userId}_${communityId}`)
      .get()
    return doc.exists
  }

  // ── Admin: Create / Update / Delete ──────────────────────
  async adminCreateCommunity(data: {
    name: string
    type: CommunityType
    city: string
    college?: string
    description?: string
    requiresApproval?: boolean
    verified?: boolean
  }): Promise<Community> {
    const ref = this.db.collection(COMMUNITIES_COLLECTION).doc()
    const community: Community = {
      id: ref.id,
      name: data.name,
      type: data.type,
      city: data.city,
      college: data.college,
      description: data.description,
      members: 0,
      verified: data.verified ?? false,
      requiresApproval: data.requiresApproval ?? false,
      createdAt: new Date(),
    }
    await ref.set(community)
    return community
  }

  async adminUpdateCommunity(id: string, data: Partial<Community>): Promise<Community> {
    await this.db.collection(COMMUNITIES_COLLECTION).doc(id).update(data)
    const updated = await this.getCommunityById(id)
    return updated!
  }

  async adminDeleteCommunity(id: string): Promise<void> {
    // Remove all join requests for this community
    const reqSnap = await this.db
      .collection(JOIN_REQUESTS_COLLECTION)
      .where('communityId', '==', id)
      .get()
    const batch = this.db.batch()
    reqSnap.docs.forEach((d) => batch.delete(d.ref))
    batch.delete(this.db.collection(COMMUNITIES_COLLECTION).doc(id))
    await batch.commit()
  }

  async verifyCommunity(id: string, verified: boolean): Promise<void> {
    await this.db.collection(COMMUNITIES_COLLECTION).doc(id).update({ verified })
  }

  // ── Join requests ─────────────────────────────────────────
  async createJoinRequest(userId: string, communityId: string, message?: string): Promise<CommunityJoinRequest> {
    // Check not already member
    if (await this.isMember(userId, communityId)) {
      throw new Error('Already a member')
    }
    // Check no pending request exists
    const existing = await this.db
      .collection(JOIN_REQUESTS_COLLECTION)
      .where('userId', '==', userId)
      .where('communityId', '==', communityId)
      .where('status', '==', 'pending')
      .get()
    if (!existing.empty) throw new Error('Join request already pending')

    const ref = this.db.collection(JOIN_REQUESTS_COLLECTION).doc()
    const req: CommunityJoinRequest = {
      id: ref.id,
      communityId,
      userId,
      status: 'pending',
      message,
      createdAt: new Date(),
    }
    await ref.set(req)
    return req
  }

  async getPendingJoinRequests(communityId?: string): Promise<CommunityJoinRequest[]> {
    let query = this.db
      .collection(JOIN_REQUESTS_COLLECTION)
      .where('status', '==', 'pending') as admin.firestore.Query
    if (communityId) query = query.where('communityId', '==', communityId)
    const snap = await query.orderBy('createdAt', 'desc').get()
    return serializeSnapshots<CommunityJoinRequest>(snap.docs)
  }

  async getAllJoinRequests(): Promise<CommunityJoinRequest[]> {
    const snap = await this.db
      .collection(JOIN_REQUESTS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()
    return serializeSnapshots<CommunityJoinRequest>(snap.docs)
  }

  async approveJoinRequest(requestId: string, adminId: string): Promise<void> {
    const reqDoc = await this.db.collection(JOIN_REQUESTS_COLLECTION).doc(requestId).get()
    if (!reqDoc.exists) throw new Error('Request not found')
    const req = reqDoc.data() as CommunityJoinRequest

    const batch = this.db.batch()
    // Update request status
    batch.update(reqDoc.ref, { status: 'approved', reviewedAt: new Date(), reviewedBy: adminId })
    // Add membership
    const memberRef = this.db
      .collection(USER_COMMUNITIES_COLLECTION)
      .doc(`${req.userId}_${req.communityId}`)
    batch.set(memberRef, { userId: req.userId, communityId: req.communityId, joinedAt: admin.firestore.FieldValue.serverTimestamp() })
    // Increment members
    batch.update(this.db.collection(COMMUNITIES_COLLECTION).doc(req.communityId), {
      members: admin.firestore.FieldValue.increment(1),
    })
    // Update user's communityId
    batch.update(this.db.collection('users').doc(req.userId), { communityId: req.communityId })
    await batch.commit()
  }

  async rejectJoinRequest(requestId: string, adminId: string): Promise<void> {
    await this.db.collection(JOIN_REQUESTS_COLLECTION).doc(requestId).update({
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: adminId,
    })
  }

  // ── Deprecated helper kept for backwards compat ──────────
  async incrementMembers(id: string): Promise<void> {
    await this.db.collection(COMMUNITIES_COLLECTION).doc(id).update({
      members: admin.firestore.FieldValue.increment(1),
    })
  }

  // ── Seed ─────────────────────────────────────────────────
  async seedCommunities(): Promise<void> {
    const seeds: Omit<Community, 'id'>[] = [
      // Colleges
      { name: 'IIT Delhi',          type: 'college',   city: 'Delhi',     college: 'IIT Delhi',               members: 0, verified: true,  createdAt: new Date() },
      { name: 'IIT Bombay',         type: 'college',   city: 'Mumbai',    college: 'IIT Bombay',              members: 0, verified: true,  createdAt: new Date() },
      { name: 'IIT Kanpur',         type: 'college',   city: 'Kanpur',    college: 'IIT Kanpur',              members: 0, verified: true,  createdAt: new Date() },
      { name: 'DU North Campus',    type: 'college',   city: 'Delhi',     college: 'Delhi University',        members: 0, verified: true,  createdAt: new Date() },
      { name: 'Jadavpur University',type: 'college',   city: 'Kolkata',   college: 'Jadavpur University',     members: 0, verified: true,  createdAt: new Date() },
      { name: 'VIT Vellore',        type: 'college',   city: 'Vellore',   college: 'VIT University',          members: 0, verified: true,  createdAt: new Date() },
      { name: 'BITS Pilani',        type: 'college',   city: 'Pilani',    college: 'BITS Pilani',             members: 0, verified: true,  createdAt: new Date() },
      { name: 'NIT Trichy',         type: 'college',   city: 'Trichy',    college: 'NIT Trichy',              members: 0, verified: true,  createdAt: new Date() },
      // Localities
      { name: 'Indiranagar',        type: 'locality',  city: 'Bangalore',                                     members: 0, verified: false, createdAt: new Date() },
      { name: 'Koramangala',        type: 'locality',  city: 'Bangalore',                                     members: 0, verified: false, createdAt: new Date() },
      { name: 'Bandra West',        type: 'locality',  city: 'Mumbai',                                        members: 0, verified: false, createdAt: new Date() },
      { name: 'Lajpat Nagar',       type: 'locality',  city: 'Delhi',                                         members: 0, verified: false, createdAt: new Date() },
      { name: 'Salt Lake City',     type: 'locality',  city: 'Kolkata',                                       members: 0, verified: false, createdAt: new Date() },
      // Apartments / Societies
      { name: 'Prestige Lakeside',  type: 'apartment', city: 'Bangalore',                                     members: 0, verified: false, createdAt: new Date() },
      { name: 'Hiranandani Gardens',type: 'society',   city: 'Mumbai',                                        members: 0, verified: false, createdAt: new Date() },
      { name: 'DLF City',           type: 'society',   city: 'Gurugram',                                      members: 0, verified: false, createdAt: new Date() },
    ]

    const batch = this.db.batch()
    for (const seed of seeds) {
      const ref = this.db.collection(COMMUNITIES_COLLECTION).doc()
      batch.set(ref, { ...seed, id: ref.id })
    }
    await batch.commit()
  }
}

export const communityRepository = new CommunityRepository()
