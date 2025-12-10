
import { loginWithSupabase } from './backend/utils/supabase-auth.js';

const run = async () => {
  console.log('🔑 Testando login com Supabase client...\n');
  
  const result = await loginWithSupabase(
    'hugosantanav9@gmail.com',
    '20631305'
  );
  
  if (result.success) {
    console.log('✅ Login bem-sucedido!');
    console.log('User ID:', result.user.id);
    console.log('Email:', result.user.email);
    console.log('Token:', result.access_token.substring(0, 50) + '...');
  } else {
    console.log('❌ Erro:', result.error);
  }
}

run();
