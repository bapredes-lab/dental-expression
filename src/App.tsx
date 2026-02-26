import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/Login'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import PatientsList from './pages/admin/patients/List'
import PatientForm from './pages/admin/patients/Form'
import MediaGallery from './pages/admin/media/Gallery'
import AgendaView from './pages/admin/agenda/Calendar'
import TreatmentPlanBuilder from './pages/admin/treatments/Builder'
import PaymentsAdmin from './pages/admin/payments/Payments'
import BeforeAfterTool from './pages/admin/before-after/Simulador'
import ReviewsList from './pages/admin/reviews/List'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="patients" element={<PatientsList />} />
            <Route path="patients/new" element={<PatientForm />} />
            <Route path="media" element={<MediaGallery />} />
            <Route path="agenda" element={<AgendaView />} />
            <Route path="treatments" element={<TreatmentPlanBuilder />} />
            <Route path="payments" element={<PaymentsAdmin />} />
            <Route path="reviews" element={<ReviewsList />} />
            <Route path="before-after" element={<BeforeAfterTool />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
