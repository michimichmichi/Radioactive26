import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ProtectedAdminRoute from './Components/ProtectedAdminRoute.jsx'
import ProtectedUserRoute from './Components/ProtectedUserRoute.jsx'
import PageLoader from './Components/PageLoader.jsx'

const AdminPage = lazy(() => import('./Pages/Admin.jsx'))
const LoginPage = lazy(() => import('./Pages/Login.jsx'))
const RegisterPage = lazy(() => import('./Pages/Register.jsx'))
const CompetitionRegistrationPage = lazy(() => import('./Pages/CompetitionRegistration.jsx'))
const ProfilePage = lazy(() => import('./Pages/Profile.jsx'))
const MyCompetitionsPage = lazy(() => import('./Pages/MyCompetitions.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/app" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/competition-registration"
            element={
              <ProtectedUserRoute>
                <CompetitionRegistrationPage />
              </ProtectedUserRoute>
            }
          />
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
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
