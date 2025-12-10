import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAPI() {
  const testEmail = `teste_${Date.now()}@affiboard.com`;
  const testPassword = 'Teste123!';
  
  console.log('📝 Criando conta de teste:', testEmail);
  
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { full_name: 'Usuário Teste API' }
    }
  });
  
  if (signupError) {
    console.error('❌ Erro no signup:', signupError.message);
    return;
  }
  
  const token = signupData.session?.access_token;
  
  if (!token) {
    console.log('⚠️ Conta criada mas email não confirmado. Tentando login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }
    
    if (!loginData.session?.access_token) {
      console.error('❌ Sem token na sessão');
      return;
    }
  }
  
  const finalToken = token || (await supabase.auth.getSession()).data.session?.access_token;
  
  if (!finalToken) {
    console.error('❌ Não foi possível obter token');
    return;
  }
  
  console.log('✅ Token obtido com sucesso!');
  console.log('\n📡 Testando /api/analyze...');
  
  const response = await fetch('http://0.0.0.0:5000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${finalToken}`
    },
    body: JSON.stringify({ url: 'https://hotmart.com/pt-br/marketplace' })
  });
  
  const result = await response.json();
  console.log('\n📊 Resultado da API:');
  console.log(JSON.stringify(result, null, 2));
}

testAPI();
