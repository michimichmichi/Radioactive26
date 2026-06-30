import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminPage from './Pages/Admin.jsx'
import LoginPage from './Pages/Login.jsx'
import RegisterPage from './Pages/Register.jsx'
import ProfilePage from './Pages/Profile.jsx'
import MyCompetitionsPage from './Pages/MyCompetitions.jsx'
import ProtectedAdminRoute from './Components/ProtectedAdminRoute.jsx'
import ProtectedUserRoute from './Components/ProtectedUserRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/app" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedUserRoute>
              <ProfilePage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/my-competitions"
          element={
            <ProtectedUserRoute>
              <MyCompetitionsPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
