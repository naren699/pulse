// Lucide-backed icon set behind the app's original `name` string API, so
// every existing call site keeps working. Add new names to the map.
import {
  House, Check, Code, Trophy, ListTodo, FileText, Timer, Target, Users,
  Bell, X, Plus, Pencil, Trash2, Calendar, Menu, LogOut, Settings, User,
  ExternalLink, Search, TriangleAlert, Clock, ChevronLeft, ChevronRight,
  ChevronDown, Pin, Flame, Inbox, Send, Lock, Copy, Sparkles, Command,
  Zap, TrendingUp, Play, Pause, RotateCcw, MessageSquare, ChevronsLeft,
} from 'lucide-react'

const ICONS = {
  home: House,
  check: Check,
  code: Code,
  trophy: Trophy,
  checkbox: ListTodo,
  note: FileText,
  timer: Timer,
  target: Target,
  users: Users,
  bell: Bell,
  x: X,
  plus: Plus,
  edit: Pencil,
  trash: Trash2,
  calendar: Calendar,
  menu: Menu,
  logout: LogOut,
  settings: Settings,
  user: User,
  external: ExternalLink,
  search: Search,
  warning: TriangleAlert,
  clock: Clock,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  pin: Pin,
  flame: Flame,
  inbox: Inbox,
  send: Send,
  lock: Lock,
  copy: Copy,
  sparkles: Sparkles,
  command: Command,
  zap: Zap,
  trending: TrendingUp,
  play: Play,
  pause: Pause,
  rotate: RotateCcw,
  message: MessageSquare,
  collapse: ChevronsLeft,
}

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.8 }) {
  const Cmp = ICONS[name]
  if (!Cmp) return null
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />
}
