
import { loginWithSupabase } from './backend/utils/supabase-auth.js';

const run = async () => {
  const result = await loginWithSupabase(
    'hugosantanav9@gmail.com',
    '20631305'
  );

  if (!result.success) {
    console.log('❌ Erro:', result.error);
    return;
  }

  console.log('============================');
  console.log('✅ LOGIN BEM-SUCEDIDO');
  console.log('============================');
  console.log('👤 User ID:', result.user.id);
  console.log('✉️ Email:', result.user.email);
  console.log('🔑 Token JWT:\n');
  console.log(result.access_token);
  console.log('\n============================');
};

run();
