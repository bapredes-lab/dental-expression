import { useState, useEffect } from 'react'
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
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
    const location = useLocation()
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="min-h-screen admin-dark-bg">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Elite */}
            <motion.aside
                initial={false}
                animate={{ 
                    width: isMobile ? 280 : (sidebarOpen ? 280 : 80),
                    x: isMobile ? (sidebarOpen ? 0 : -280) : 0
                }}
                className={`fixed inset-y-0 left-0 ${isMobile ? 'z-50' : 'z-40'} bg-[#052c46] text-white shadow-2xl transition-all duration-300`}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Brand Pill */}
                    <div className="p-6">
                        <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                            {/* Tooth icon — siempre visible */}
                            <div className="shrink-0">
                                <svg width="30" height="34" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M16 1C9.5 1 4 5.8 4 12c0 3.2 1.2 5.8 2.5 8L9 30c.6 3 1.8 5 3.5 5s2.5-1.5 3.5-5l.3-1.5.2 1.5c1 3.5 1.8 5 3.5 5s2.9-2 3.5-5l2.5-10C27 17.8 28 15.2 28 12c0-6.2-5.5-11-12-11z"
                                        fill="#3ABDE0"
                                        style={{ filter: 'drop-shadow(0 0 5px rgba(58,189,224,0.7))' }}
                                    />
                                </svg>
                            </div>
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex flex-col leading-none overflow-hidden"
                                    >
                                        <span
                                            style={{
                                                fontFamily: '"Dancing Script", cursive',
                                                fontSize: '1.15rem',
                                                fontWeight: 700,
                                                color: '#ffffff',
                                                textShadow: '0 0 12px rgba(58,189,224,0.6)',
                                                whiteSpace: 'nowrap',
                                                lineHeight: 1.1,
                                            }}
                                        >
                                            Dental Expression
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '0.58rem',
                                                fontWeight: 700,
                                                color: '#3ABDE0',
                                                letterSpacing: '0.22em',
                                                textTransform: 'uppercase',
                                                marginTop: '3px',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            Nataly · Vargas
                                        </span>
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
                                    onClick={() => isMobile && setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group
                                        ${isActive
                                            ? 'bg-gradient-to-r from-emerald-500/25 to-emerald-400/10 text-emerald-300 border border-emerald-400/30 shadow-lg shadow-emerald-900/20'
                                            : 'text-slate-200 hover:text-white hover:bg-white/10'}
                                    `}
                                    title={!sidebarOpen ? item.name : ''}
                                >
                                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-300 group-hover:scale-110 transition-transform'}`} />
                                    {sidebarOpen && <span className="font-semibold text-base truncate">{item.name}</span>}
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
                                    <p className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || user?.email}</p>
                                    <p className="text-xs font-black text-emerald-400 uppercase tracking-tighter">{user?.user_metadata?.rol || 'Administrador'}</p>
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
                style={{ marginLeft: isMobile ? 0 : (sidebarOpen ? 280 : 80) }}
            >
                {/* Global Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 border border-white/10 transition-all"
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                        <h2 className="text-xl font-bold text-white tracking-tight">Panel de Control</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-right text-right mr-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sede Principal</p>
                            <p className="text-xs font-bold text-slate-300">{user?.user_metadata?.clinica_nombre || 'Mi Clínica'}</p>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-xl text-slate-400 border border-white/10 relative transition-all">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#06111e]" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-xl text-slate-400 border border-white/10 transition-all">
                            <Settings className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="w-full">
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
