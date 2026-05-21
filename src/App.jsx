import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'

import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import ContactsPage from './pages/ContactsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute><ChatPage /></PrivateRoute>
        } />
        <Route path="/contacts" element={
          <PrivateRoute><ContactsPage /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute><SettingsPage /></PrivateRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}