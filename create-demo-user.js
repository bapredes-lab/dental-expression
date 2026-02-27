import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oczgahyevzhxuhpkcnrg.supabase.co'
const supabaseAnonKey = 'sb_publishable_cEkaAj7ymWmdYrG1GYohhQ_7ok7t9Dc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createDemoUser() {
    const { data, error } = await supabase.auth.signUp({
        email: 'demo@dentalexpression.app',
        password: 'Demo2024!',
        options: {
            data: {
                full_name: 'Dr. Demo',
            }
        }
    })

    if (error) {
        console.error('Error creating user:', error.message)
    } else {
        console.log('User created successfully:', data.user?.email)
    }
}

createDemoUser()
