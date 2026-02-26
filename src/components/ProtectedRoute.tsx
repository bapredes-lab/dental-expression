import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    {/* Loader simple */}
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-gray-500">Cargando aplicación...</p>
                </div>
            </div>
        )
    }

    // Simulación MVP si no hay claves de Supabase
    if (import.meta.env.VITE_SUPABASE_URL === '') {
        return <>{children}</>
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}
