
import fetch from 'node-fetch';

(async () => {
  const base = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : "http://0.0.0.0:5000";

  console.log(`🔎 Testando MVP em: ${base}\n`);

  console.log("1️⃣ Testando /api/health...");
  try {
    const res = await fetch(`${base}/api/health`);
    const data = await res.text();
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   📦 Response: ${data}\n`);
  } catch (err) {
    console.log(`   ❌ Erro: ${err.message}\n`);
  }

  console.log("2️⃣ Testando /api/analyze-mvp (sem auth - esperado 401)...");
  try {
    const res = await fetch(`${base}/api/analyze-mvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://exemplo.com" })
    });
    const data = await res.text();
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   📦 Response: ${data}\n`);
  } catch (err) {
    console.log(`   ❌ Erro: ${err.message}\n`);
  }

  console.log("3️⃣ Testando /api/credits (sem auth - esperado 401)...");
  try {
    const res = await fetch(`${base}/api/credits`);
    const data = await res.text();
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   📦 Response: ${data}\n`);
  } catch (err) {
    console.log(`   ❌ Erro: ${err.message}\n`);
  }

  console.log("✅ Testes concluídos!");
  console.log("\n📋 Próximos passos:");
  console.log("   1. Faça login no frontend");
  console.log("   2. Teste a análise completa com autenticação");
})();
