import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Calendar,
    Image as ImageIcon,
    FileText,
    DollarSign,
    PlusSquare,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Bell,
    Settings,
    Star,
    Video,
    CalendarClock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Fichas de Pacientes', href: '/admin/patients', icon: Users },
    { name: 'Agenda Digital', href: '/admin/agenda', icon: Calendar },
    { name: 'Disponibilidad', href: '/admin/disponibilidad', icon: CalendarClock },
    { name: 'Teleconsultas', href: '/admin/teleconsultas', icon: Video },
    { name: 'Galería Médica', href: '/admin/media', icon: ImageIcon },
    { name: 'Planes de Tratamiento', href: '/admin/treatments', icon: FileText },
    { name: 'Pagos y Recaudos', href: '/admin/payments', icon: DollarSign },
    { name: 'Reseñas', href: '/admin/reviews', icon: Star },
    { name: 'Antes y Después', href: '/admin/before-after', icon: PlusSquare },
]

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const location = useLocation()
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-[#f1f5f9]">
            {/* Sidebar Elite */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                className="fixed inset-y-0 left-0 z-50 bg-[#052c46] text-white shadow-2xl transition-all duration-300"
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand Pill */}
                    <div className="p-6">
                        <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                            <div className="bg-white p-2 rounded-2xl shadow-lg ring-4 ring-white/10 shrink-0">
                                <img src="/logo.jpg" alt="Logo" className="h-8 w-auto object-contain" />
                            </div>
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex flex-col overflow-hidden"
                                    >
                                        <span translate="no" className="text-sm font-black tracking-tighter text-white whitespace-nowrap">{user?.user_metadata?.clinica_nombre || 'MI CLÍNICA'}</span>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest whitespace-nowrap">{user?.user_metadata?.full_name || user?.email}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group
                                        ${isActive
                                            ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-900/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                    `}
                                    title={!sidebarOpen ? item.name : ''}
                                >
                                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-400' : 'group-hover:scale-110 transition-transform'}`} />
                                    {sidebarOpen && <span className="font-semibold text-sm truncate">{item.name}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Admin Profile Glass Section */}
                    <div className="p-4 mt-auto border-t border-white/5 bg-white/5 backdrop-blur-sm">
                        <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black shadow-lg ring-2 ring-white/20">
                                {user?.email?.[0].toUpperCase() || 'N'}
                            </div>
                            {sidebarOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{user?.user_metadata?.full_name || user?.email}</p>
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">{user?.user_metadata?.rol || 'Administrador'}</p>
                                </div>
                            )}
                            {sidebarOpen && (
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main
                className={`transition-all duration-300 min-h-screen py-6 px-4 md:px-8`}
                style={{ marginLeft: sidebarOpen ? 280 : 80 }}
            >
                {/* Global Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-white rounded-xl text-slate-500 shadow-sm border border-slate-100 transition-all"
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Panel de Control</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-right text-right mr-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede Principal</p>
                            <p className="text-xs font-bold text-slate-700">{user?.user_metadata?.clinica_nombre || 'Mi Clínica'}</p>
                        </div>
                        <button className="p-2 hover:bg-white rounded-xl text-slate-500 shadow-sm border border-slate-100 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button className="p-2 hover:bg-white rounded-xl text-slate-500 shadow-sm border border-slate-100">
                            <Settings className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="max-w-[1200px] mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Zynaia Watermark */}
                <div className="fixed bottom-4 right-6 pointer-events-none opacity-20 z-10">
                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">© Zynaia 2026</p>
                </div>
            </main>
        </div>
    )
}
