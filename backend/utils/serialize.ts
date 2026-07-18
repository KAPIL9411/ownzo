/**
 * Utility functions to serialize Firestore data for API responses
 */

/**
 * Convert Firestore Timestamp to ISO string
 */
export function serializeTimestamp(timestamp: any): string | null {
  if (!timestamp) return null
  
  // Firestore Timestamp with toDate() method
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString()
  }
  
  // Firestore Timestamp-like object with seconds
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toISOString()
  }
  
  // Already a Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  
  // Already a string
  if (typeof timestamp === 'string') {
    return timestamp
  }
  
  return null
}

/**
 * Serialize a document from Firestore, converting all Timestamps to ISO strings
 */
export function serializeDocument<T = any>(doc: any): T {
  if (!doc || typeof doc !== 'object') {
    return doc
  }

  const serialized: any = Array.isArray(doc) ? [] : {}

  for (const key in doc) {
    const value = doc[key]

    if (value === null || value === undefined) {
      serialized[key] = value
    } else if (Array.isArray(value)) {
      serialized[key] = value.map((item) => serializeDocument(item))
    } else if (typeof value === 'object') {
      // Check if it's a Firestore Timestamp
      if (value.toDate && typeof value.toDate === 'function') {
        serialized[key] = value.toDate().toISOString()
      } else if (value.seconds && typeof value.seconds === 'number') {
        serialized[key] = new Date(value.seconds * 1000).toISOString()
      } else if (value instanceof Date) {
        serialized[key] = value.toISOString()
      } else {
        // Recursively serialize nested objects
        serialized[key] = serializeDocument(value)
      }
    } else {
      serialized[key] = value
    }
  }

  return serialized as T
}

/**
 * Serialize multiple documents
 */
export function serializeDocuments<T = any>(docs: any[]): T[] {
  return docs.map((doc) => serializeDocument<T>(doc))
}

/**
 * Serialize a Firestore document snapshot
 */
export function serializeSnapshot<T = any>(snapshot: any): T | null {
  if (!snapshot || !snapshot.exists) {
    return null
  }

  return serializeDocument<T>({
    id: snapshot.id,
    ...snapshot.data(),
  })
}

/**
 * Serialize multiple Firestore document snapshots
 */
export function serializeSnapshots<T = any>(snapshots: any[]): T[] {
  return snapshots
    .filter((snapshot) => snapshot.exists)
    .map((snapshot) =>
      serializeDocument<T>({
        id: snapshot.id,
        ...snapshot.data(),
      })
    )
}
