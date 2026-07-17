import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../config/firebase'

const groupsCol = () => collection(db, 'groups')

function makeJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createGroup(uid, { name, description, privacy }) {
  const ref = await addDoc(groupsCol(), {
    name: name.trim(),
    description: description?.trim() || '',
    ownerId: uid,
    privacy,
    joinCode: makeJoinCode(),
    memberIds: [uid],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function joinGroup(uid, group) {
  await updateDoc(doc(db, 'groups', group.id), { memberIds: arrayUnion(uid) })
}

export async function joinGroupByCode(uid, code) {
  const snap = await getDocs(query(groupsCol(), where('joinCode', '==', code.trim().toUpperCase())))
  if (snap.empty) throw new Error('No group found with that code.')
  const groupDoc = snap.docs[0]
  await updateDoc(groupDoc.ref, { memberIds: arrayUnion(uid) })
  return groupDoc.id
}

export async function leaveGroup(uid, groupId) {
  await updateDoc(doc(db, 'groups', groupId), { memberIds: arrayRemove(uid) })
}

export async function renameGroup(groupId, name) {
  await updateDoc(doc(db, 'groups', groupId), { name: name.trim() })
}

export async function removeMember(groupId, memberId) {
  await updateDoc(doc(db, 'groups', groupId), { memberIds: arrayRemove(memberId) })
}

export async function deleteGroup(groupId) {
  const messages = await getDocs(collection(db, 'groups', groupId, 'messages'))
  const batch = writeBatch(db)
  messages.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db, 'groups', groupId))
  await batch.commit()
}

export async function sendMessage(groupId, { senderId, senderName, text }) {
  await addDoc(collection(db, 'groups', groupId, 'messages'), {
    senderId,
    senderName,
    text: text.trim(),
    pinned: false,
    createdAt: serverTimestamp(),
  })
}

export async function togglePin(groupId, message) {
  await updateDoc(doc(db, 'groups', groupId, 'messages', message.id), { pinned: !message.pinned })
}

export async function deleteMessage(groupId, messageId) {
  await deleteDoc(doc(db, 'groups', groupId, 'messages', messageId))
}
