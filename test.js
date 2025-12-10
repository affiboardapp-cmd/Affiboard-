
import { supabase } from './supabaseClient.js';

async function main() {
  console.log("🔍 Testando conexão com o Supabase...\n");

  // Gerar email único
  const uniqueEmail = `teste-${Date.now()}@affiboard.com`;
  const password = "TestPassword123!";

  // 1. Criar conta
  console.log("📝 Teste 1: Criando conta...");
  console.log("   Email:", uniqueEmail);
  
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: uniqueEmail,
    password: password,
    options: {
      data: {
        full_name: "Usuário Teste Replit"
      }
    }
  });

  if (signupError) {
    console.log("❌ Erro no signup:", signupError.message);
    console.log("   Detalhes:", signupError);
    return;
  }

  console.log("✅ Signup bem-sucedido");
  const user = signupData.user;
  if (!user) {
    console.log("❌ Usuário não foi criado");
    return;
  }
  console.log("   User ID:", user.id);

  // Aguardar um pouco para o trigger criar o profile
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 2. Buscar profile
  console.log("\n👤 Teste 2: Buscando perfil criado automaticamente...");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.log("❌ Erro ao buscar perfil:", profileError.message);
    console.log("   Detalhes:", profileError);
  } else {
    console.log("✅ Perfil encontrado automaticamente:");
    console.log("   ID:", profile.id);
    console.log("   Email:", profile.email);
    console.log("   Créditos:", profile.credits);
    console.log("   Criado em:", profile.created_at);
  }

  // 3. Testar consumo de créditos via RPC
  console.log("\n💳 Teste 3: Testando RPC consume_credits...");
  const { data: consumed, error: consumeError } = await supabase.rpc(
    'consume_credits',
    { p_user_id: user.id, p_amount: 1 }
  );

  if (consumeError) {
    console.log("❌ Erro ao consumir créditos:", consumeError.message);
    console.log("   Detalhes:", consumeError);
  } else {
    console.log("✅ RPC executado:");
    console.log("   Resultado:", consumed);
    console.log("   Tipo:", typeof consumed);
  }

  // 4. Verificar créditos após consumo
  if (!consumeError) {
    console.log("\n🔍 Teste 4: Verificando créditos após consumo...");
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();
    
    if (updatedProfile) {
      console.log("✅ Créditos atualizados:", updatedProfile.credits);
    }
  }

  // 5. Buscar histórico de análises
  console.log("\n📊 Teste 5: Buscando tabela analysis_logs...");
  const { data: logs, error: logsError } = await supabase
    .from("analysis_logs")
    .select("*")
    .eq("user_id", user.id);

  if (logsError) {
    console.log("⚠️ Erro ao buscar logs:", logsError.message);
    console.log("   (Tabela pode não existir ainda)");
  } else {
    console.log("✅ Tabela analysis_logs encontrada");
    console.log("   Total de registros:", logs?.length || 0);
  }

  console.log("\n✨ Testes finalizados!");
  console.log("\n📋 Resumo:");
  console.log("   - Signup:", signupError ? "❌" : "✅");
  console.log("   - Profile criado:", profileError ? "❌" : "✅");
  console.log("   - RPC consume_credits:", consumeError ? "❌" : "✅");
}

main().catch(console.error);
