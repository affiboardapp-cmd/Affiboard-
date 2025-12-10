import { createClient } from '@supabase/supabase-js';

// Usa as variáveis de ambiente do Replit (com ou sem prefixo VITE_)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.error('Configure SUPABASE_URL e SUPABASE_ANON_KEY nos secrets do Replit');
  process.exit(1);
}

console.log('📡 Conectando ao Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('🚀 Iniciando testes do Supabase...\n');

  try {
    // Test 1: Signup
    console.log('📝 Teste 1: Criando conta...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: `teste-${Date.now()}@affiboard.com`,
      password: 'TestPassword123!',
    });

    if (signupError) {
      console.log('⚠️ Signup:', signupError.message);
    } else {
      console.log('✅ Signup bem-sucedido');
    }

    // Test 2: Login
    console.log('\n🔑 Teste 2: Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'teste@affiboard.com',
      password: '12345678',
    });

    if (loginError) {
      console.log('⚠️ Login:', loginError.message);
    } else if (loginData?.user) {
      console.log('✅ Login bem-sucedido, User ID:', loginData.user.id);
    }

    // Test 3: Get Profile
    if (loginData?.user) {
      console.log('\n👤 Teste 3: Buscando perfil...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();

      if (profileError) {
        console.log('⚠️ Erro ao buscar perfil:', profileError.message);
      } else {
        console.log('✅ Perfil encontrado:', profile);
      }

      // Test 4: Consume Credits
      console.log('\n💳 Teste 4: Consumindo créditos...');
      const { data: consumed, error: consumeError } = await supabase.rpc('consume_credits', {
        p_amount: 1,
      });

      if (consumeError) {
        console.log('⚠️ Erro ao consumir créditos:', consumeError.message);
      } else {
        console.log('✅ Créditos consumidos:', consumed);
      }

      // Test 5: Get Analysis Logs
      console.log('\n📊 Teste 5: Buscando histórico de análises...');
      const { data: logs, error: logsError } = await supabase
        .from('analysis_logs')
        .select('*')
        .eq('user_id', loginData.user.id)
        .limit(5);

      if (logsError) {
        console.log('⚠️ Erro ao buscar histórico:', logsError.message);
      } else {
        console.log('✅ Histórico de análises (últimas 5):', logs?.length || 0, 'registros');
        if (logs && logs.length > 0) {
          console.log('  Primeira análise:', logs[0]);
        }
      }
    }

    console.log('\n✨ Todos os testes concluídos!');
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

runTests();
