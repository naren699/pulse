import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import ProtectedRoute from './layout/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import NotFoundPage from './pages/NotFoundPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import AttendancePage from './features/attendance/pages/AttendancePage'
import MonthlyReportPage from './features/attendance/pages/MonthlyReportPage'
import ChallengesPage from './features/challenges/pages/ChallengesPage'
import HackathonsPage from './features/hackathons/pages/HackathonsPage'
import TasksPage from './features/tasks/pages/TasksPage'
import NotesPage from './features/notes/pages/NotesPage'
import FocusPage from './features/focus/pages/FocusPage'
import GoalsPage from './features/goals/pages/GoalsPage'
import GroupsPage from './features/groups/pages/GroupsPage'
import GroupChatPage from './features/groups/pages/GroupChatPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance/monthly" element={<MonthlyReportPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/hackathons" element={<HackathonsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/focus" element={<FocusPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupChatPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
