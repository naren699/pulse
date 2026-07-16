import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../../../config/firebase'

const hackathonsCol = () => collection(db, 'hackathons')

export async function createHackathon(uid, data, imageFile) {
  const docRef = await addDoc(hackathonsCol(), {
    title: data.title.trim(),
    description: data.description.trim(),
    startAt: data.startAt,
    endAt: data.endAt || null,
    registrationDeadline: data.registrationDeadline || null,
    registrationLink: data.registrationLink.trim(),
    location: data.location?.trim() || null,
    coverImageUrl: null,
    tags: data.tags || [],
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  if (imageFile) {
    const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase()
    const imageRef = ref(storage, `hackathons/${docRef.id}/cover.${ext}`)
    await uploadBytes(imageRef, imageFile)
    const url = await getDownloadURL(imageRef)
    await updateDoc(docRef, { coverImageUrl: url, coverImagePath: imageRef.fullPath })
  }
  return docRef.id
}

export async function deleteHackathon(hackathon) {
  if (hackathon.coverImagePath) {
    try {
      await deleteObject(ref(storage, hackathon.coverImagePath))
    } catch (err) {
      console.warn('Cover image cleanup failed:', err?.code || err)
    }
  }
  await deleteDoc(doc(db, 'hackathons', hackathon.id))
  return true
}

export function splitHackathons(hackathons, now = new Date()) {
  const upcoming = []
  const past = []
  hackathons.forEach((h) => {
    const start = h.startAt?.toDate ? h.startAt.toDate() : new Date(h.startAt)
    const end = h.endAt ? (h.endAt.toDate ? h.endAt.toDate() : new Date(h.endAt)) : null
    if ((end || start) >= now) upcoming.push(h)
    else past.push(h)
  })
  upcoming.sort((a, b) => (a.startAt?.seconds || 0) - (b.startAt?.seconds || 0))
  past.sort((a, b) => (b.startAt?.seconds || 0) - (a.startAt?.seconds || 0))
  return { upcoming, past }
}
