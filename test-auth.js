require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_anon_key';

async function testAuth() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const email = `test_${Date.now()}@gmail.com`;
  const phone = `+1${Date.now()}`;
  
  console.log('Attempting to create user with email:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test Customer',
        phone,
        role: 'customer'
      }
    }
  });
  
  if (error) {
    console.error('Error signing up:', error.message);
    return;
  }
  
  console.log('Signup successful:', data.user?.id);
  
  // Verify if profile was created
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user?.id)
    .single();
    
  if (profileErr || !profile) {
    console.error('Profile not created!', profileErr);
  } else {
    console.log('Profile created successfully:', profile);
  }
}

testAuth();
