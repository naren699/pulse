import { collection } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useFirestoreListener } from './useFirestoreListener'
import { splitHackathons } from '../services/hackathons/hackathonService'

export function useHackathons() {
  const { data, loading, error } = useFirestoreListener(collection(db, 'hackathons'), null, [])
  const { upcoming, past } = splitHackathons(data || [])
  return { upcoming, past, loading, error }
}
