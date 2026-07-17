import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { collection, doc, orderBy, query } from 'firebase/firestore'
import { db } from '@pulse/shared/config'
import { useAuth } from '@pulse/shared/context'
import { useFirestoreListener } from '@pulse/shared/hooks'
import {
  sendMessage,
  togglePin,
  deleteGroup,
  leaveGroup,
  renameGroup,
} from '@pulse/shared/services'
import Modal, { ConfirmModal } from '../../../shared/components/Modal'
import Button from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import Icon from '../../../shared/components/Icon'
import { PageSpinner } from '../../../shared/components/Spinner'
import { useToast } from '../../../shared/components/Toast'
import { formatTime } from '@pulse/shared/utils'

// Split message text so bare URLs become clickable links.
function Linkify({ text }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-primary-light underline">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function MessageBubble({ message, isOwn, isOwner, onPin }) {
  return (
    <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[75%] rounded-3xl border px-4 py-2.5 backdrop-blur-xl',
          isOwn
            ? 'rounded-br-lg border-primary/30 bg-gradient-to-br from-primary/30 to-secondary/20 text-text-primary shadow-[0_8px_28px_-10px_rgba(124,108,255,0.5)]'
            : 'rounded-bl-lg border-white/[0.07] bg-white/[0.05] text-text-secondary',
        ].join(' ')}
      >
        {!isOwn && <p className="mb-0.5 font-display text-[11px] font-semibold text-primary-light">{message.senderName}</p>}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed"><Linkify text={message.text} /></p>
        <div className="mt-1 flex items-center justify-end gap-2">
          {message.pinned && <span className="text-[10px] text-amber-300">📌 pinned</span>}
          <span className="text-[10px] text-text-subtle">{formatTime(message.createdAt)}</span>
          {isOwner && (
            <button
              onClick={() => onPin(message)}
              className="text-[10px] text-text-subtle opacity-0 transition-opacity hover:text-amber-300 group-hover:opacity-100"
            >
              {message.pinned ? 'unpin' : 'pin'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GroupChatPage() {
  const { groupId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const showToast = useToast()
  const [text, setText] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef(null)

  const { data: group, loading: groupLoading } = useFirestoreListener(
    doc(db, 'groups', groupId),
    null,
    [groupId],
  )
  const { data: messages, loading: messagesLoading } = useFirestoreListener(
    query(collection(db, 'groups', groupId, 'messages'), orderBy('createdAt', 'asc')),
    null,
    [groupId],
  )

  const list = messages || []
  const pinned = list.filter((m) => m.pinned)
  const isOwner = group?.ownerId === user?.uid
  const isMember = group?.memberIds?.includes(user?.uid)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [list.length])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const value = text
    setText('')
    try {
      await sendMessage(groupId, { senderId: user.uid, senderName: profile?.displayName || 'Student', text: value })
    } catch (err) {
      console.error(err)
      setText(value)
      showToast('Message failed to send.', 'error')
    }
  }

  const handleDeleteGroup = async () => {
    setBusy(true)
    try {
      await deleteGroup(groupId)
      showToast('Group deleted', 'info')
      navigate('/groups')
    } catch (err) {
      console.error(err)
      showToast('Could not delete group.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleLeave = async () => {
    try {
      await leaveGroup(user.uid, groupId)
      showToast('Left group', 'info')
      navigate('/groups')
    } catch (err) {
      console.error(err)
      showToast('Could not leave group.', 'error')
    }
  }

  const handleRename = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await renameGroup(groupId, newName)
      showToast('Group renamed', 'success')
      setNewName('')
    } catch (err) {
      console.error(err)
      showToast('Could not rename group.', 'error')
    }
  }

  if (groupLoading) return <PageSpinner label="Opening group…" />
  if (!group) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-tertiary">Group not found.</p>
        <Link to="/groups" className="text-primary-light hover:underline">← Back to Groups</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-180px)] max-w-[800px] flex-col" style={{ '--accent': '#8b5cf6' }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/groups" className="text-xs text-primary-light hover:underline">← Groups</Link>
          <h1 className="truncate font-display text-xl font-bold">{group.name}</h1>
          <p className="text-xs text-text-subtle">
            {group.memberIds?.length || 0} members
            {group.joinCode && isMember && (
              <> · code <span className="font-brand-mono tracking-[0.15em] text-primary-light">{group.joinCode}</span></>
            )}
          </p>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-slate-200/10 hover:text-text-primary"
          aria-label="Group settings"
        >
          <Icon name="settings" size={18} />
        </button>
      </div>

      {pinned.length > 0 && (
        <div className="mb-3 rounded-xl border border-warning/20 bg-warning/10 px-4 py-2.5">
          {pinned.map((m) => (
            <p key={m.id} className="truncate text-xs text-amber-200">
              📌 <span className="font-semibold">{m.senderName}:</span> {m.text}
            </p>
          ))}
        </div>
      )}

      <div className="card-glass flex-1 space-y-3 overflow-y-auto p-4">
        {messagesLoading ? (
          <p className="py-8 text-center text-sm text-text-subtle">Loading messages…</p>
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-subtle">No messages yet — say hi 👋</p>
        ) : (
          list.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isOwn={m.senderId === user.uid}
              isOwner={isOwner}
              onPin={(msg) => togglePin(groupId, msg).catch(() => showToast('Could not pin message.', 'error'))}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isMember ? 'Type a message…' : 'Join this group to send messages'}
          disabled={!isMember}
          className="field-glass min-w-0 flex-1 rounded-full"
        />
        <Button type="submit" disabled={!isMember || !text.trim()} aria-label="Send message">
          <Icon name="send" size={16} />
        </Button>
      </form>

      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="Group Settings">
        {isOwner ? (
          <>
            <form onSubmit={handleRename} className="mb-6">
              <Input label="Rename Group" placeholder={group.name} value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Button type="submit" size="sm" variant="secondary">Rename</Button>
            </form>
            <div className="border-t border-slate-200/10 pt-5">
              <p className="mb-3 text-xs text-text-tertiary">Danger zone</p>
              <Button variant="danger" onClick={() => { setSettingsOpen(false); setConfirmDelete(true) }}>
                Delete Group
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-5 text-sm">You're a member of this group.</p>
            <Button variant="danger" onClick={handleLeave}>Leave Group</Button>
          </>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteGroup}
        loading={busy}
        title="Delete Group"
        message={`Delete "${group.name}" and all its messages? This cannot be undone.`}
      />
    </div>
  )
}
