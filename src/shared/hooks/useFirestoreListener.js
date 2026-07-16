import { useEffect, useRef, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'

/**
 * Subscribe to a Firestore query/doc ref and keep the mapped result in state.
 * Unsubscribes automatically on unmount or when `ref` changes.
 *
 * @param {object|null} ref - Firestore query or document reference (null skips)
 * @param {(snapshot) => any} [map] - maps the snapshot to data; defaults to
 *   an array of `{ id, ...data }` for queries or `{ id, ...data }` for docs.
 * @param {any[]} deps - dependency list that recreates the subscription
 */
export function useFirestoreListener(ref, map, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(ref))
  const [error, setError] = useState(null)
  const mapRef = useRef(map)
  mapRef.current = map

  useEffect(() => {
    if (!ref) {
      setData(null)
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const mapper =
          mapRef.current ||
          ((snap) =>
            snap.docs
              ? snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
              : snap.exists()
                ? { id: snap.id, ...snap.data() }
                : null)
        setData(mapper(snapshot))
        setError(null)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore listener error:', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
