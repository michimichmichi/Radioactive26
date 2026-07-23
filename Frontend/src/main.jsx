import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ProtectedAdminRoute from './Components/ProtectedAdminRoute.jsx'
import ProtectedUserRoute from './Components/ProtectedUserRoute.jsx'

const lazyWithRetry = (importer, chunkName) => lazy(async () => {
  try {
    return await importer();
  } catch (error) {
    const retryKey = `radioactive-chunk-retry:${chunkName}`;

    if (!sessionStorage.getItem(retryKey)) {
      sessionStorage.setItem(retryKey, '1');
      window.location.reload();
      return new Promise(() => {});
    }

    sessionStorage.removeItem(retryKey);
    throw error;
  }
});

const AdminPage = lazyWithRetry(() => import('./Pages/Admin.jsx'), 'admin')
const LoginPage = lazyWithRetry(() => import('./Pages/Login.jsx'), 'login')
const RegisterPage = lazyWithRetry(() => import('./Pages/Register.jsx'), 'register')
const CompetitionRegistrationPage = lazyWithRetry(() => import('./Pages/CompetitionRegistration.jsx'), 'competition-registration')
const ProfilePage = lazyWithRetry(() => import('./Pages/Profile.jsx'), 'profile')
const MyCompetitionsPage = lazyWithRetry(() => import('./Pages/MyCompetitions.jsx'), 'my-competitions')

function PageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="rounded-lg border border-pink-400/30 px-6 py-4 text-pink-300">
        Loading...
      </div>
    </main>
  )
}

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
