import { adminAuth } from './config'

export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Error verifying token:', error)
    throw new Error('Invalid token')
  }
}

export async function getUserById(uid: string) {
  try {
    const userRecord = await adminAuth.getUser(uid)
    return userRecord
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function createCustomToken(uid: string) {
  try {
    const customToken = await adminAuth.createCustomToken(uid)
    return customToken
  } catch (error) {
    console.error('Error creating custom token:', error)
    throw new Error('Failed to create custom token')
  }
}
