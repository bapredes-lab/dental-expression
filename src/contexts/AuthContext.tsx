import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthContextType = {
    session: Session | null
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{
            session,
            user,
            loading,
            signIn: async (email, password) => {
                // MODO SIMULADOR: Permitir acceso con credenciales de prueba sin Supabase
                if (email === 'admin@test.com' && password === '123456') {
                    const mockSession = {
                        access_token: 'mock-token',
                        user: { email: 'admin@test.com', id: 'mock-id' }
                    } as any
                    setSession(mockSession)
                    setUser(mockSession.user)
                    return
                }

                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            },
            signOut: async () => {
                const { error } = await supabase.auth.signOut()
                if (error) throw error
            }
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
