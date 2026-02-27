import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, Key, Mail, ShieldCheck } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await signIn(email, password)
            navigate('/admin')
        } catch (err: any) {
            setError('Credenciales inválidas. Por favor, intente de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#052c46] overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#059669]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0F4C75]/30 rounded-full blur-[150px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-[450px]"
            >
                {/* Logo Section Elite */}
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="bg-white p-4 rounded-3xl shadow-2xl luxury-shadow mb-6 relative group"
                    >
                        <img
                            src="/logo.jpg"
                            alt="Logo Nataly Vargas"
                            className="h-24 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                    </motion.div>

                    <div className="text-center space-y-1">
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            DENTAL <span className="text-emerald-400">EXPRESSION</span>
                        </h1>
                        <p className="text-emerald-100/60 font-medium tracking-[0.2em] uppercase text-xs">
                            Dra. Nataly Vargas
                        </p>
                    </div>
                </div>

                {/* Login Card Glassmorphism */}
                <div className="glass-card p-8 rounded-[2rem] border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-100/80 ml-1 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Correo Electrónico
                                </Label>
                                <div className="relative group">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@test.com"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 h-12 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all pl-4"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-0 rounded-xl pointer-events-none border border-emerald-500/0 group-focus-within:border-emerald-500/30 transition-all duration-300" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" title="Contraseña" className="text-slate-100/80 ml-1 flex items-center gap-2">
                                    <Key className="w-4 h-4" /> Contraseña
                                </Label>
                                <div className="relative group">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-400 h-12 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all pl-4"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-0 rounded-xl pointer-events-none border border-emerald-500/0 group-focus-within:border-emerald-500/30 transition-all duration-300" />
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-lg text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-[#0F4C75] to-[#059669] hover:brightness-110 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 group overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'CONECTANDO...' : 'ACCEDER AL SISTEMA'}
                                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#059669] to-[#0F4C75] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            Dental Expression v2.0 <span className="text-emerald-500/50 mx-2">|</span> <span className="text-[#059669]">Desarrollado por Zynaia • Software a la Medida</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
