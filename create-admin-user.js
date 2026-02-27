import { createClient } from '@supabase/supabase-js'

// Reemplaza <TU_SERVICE_ROLE_KEY> con el "service_role secret" 
// que encuentras en Supabase -> Project Settings -> API.
// NO uses la clave anónima pública (anon key) ni lo expongas en producción frontal.

const supabaseUrl = 'https://oczgahyevzhxuhpkcnrg.supabase.co'
const supabaseServiceRoleKey = '<TU_SERVICE_ROLE_KEY>'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdminUser() {
    console.log("Creando usuario con permisos de administrador...")

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: 'demo@dentalexpression.app',
        password: 'Demo2024!',
        email_confirm: true, // Esto auto-confirma el email para que pueda entrar de inmediato
        user_metadata: {
            full_name: 'Dr. Demo',
            role: 'admin'
        }
    })

    if (error) {
        console.error('Error al crear usuario:', error.message)
    } else {
        console.log('✅ Usuario creado exitosamente con la API de Admin:', data.user?.email)
    }
}

createAdminUser()
