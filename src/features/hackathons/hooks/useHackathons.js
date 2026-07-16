import { collection } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useFirestoreListener } from '../../../shared/hooks/useFirestoreListener'
import { splitHackathons } from '../services/hackathonService'

export function useHackathons() {
  const { data, loading, error } = useFirestoreListener(collection(db, 'hackathons'), null, [])
  const { upcoming, past } = splitHackathons(data || [])
  return { upcoming, past, loading, error }
}
