✅ 1. README.md PROFISSIONAL PARA O MVP

(Copie e cole em um arquivo chamado README.md no Replit)


---

AffiBoard — MVP

Sistema de Análise Inteligente de Ofertas para Afiliados (Hotmart / Kiwify / Monetizze / Eduzz)
Frontend: React + Vite + TypeScript + Tailwind
Backend: Supabase (Auth, RLS, RPC, Edge Functions) + Scraper híbrido (HTML + Firecrawl)


---

🚀 Visão Geral

O AffiBoard é um sistema criado para ajudar afiliados a tomar decisões rápidas e inteligentes sobre produtos digitais e físicos disponíveis em diversas plataformas de vendas.

O MVP permite:

Criar conta e fazer login

Consumir créditos a cada análise

Enviar URL de oferta e receber análise completa

Salvar histórico de análises

Consultar detalhes de cada análise

Ver saldo de créditos

Gerar relatórios manuais

Exportar dados do Supabase



---

🏗️ Arquitetura do Projeto

affiboard-frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AnalyzePage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── AnalysisDetailPage.tsx
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   └── api.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── styles/
│   └── main.tsx
│
├── test-supabase.ts
├── package.json
├── README.md
└── .env


---

🔑 Integração com Supabase

🔐 Autenticação

O projeto usa:

supabase.auth.signUp

supabase.auth.signInWithPassword

Persistência de sessão via Supabase


🪙 Créditos

O consumo de créditos é feito via RPC:

SELECT consume_credits(p_user_id := user.id, p_amount := 1);

📄 Históricos

As análises são salvas automaticamente via:

SELECT perform_analysis_and_log(...);


---

⚡ Edge Function usada no MVP

A função que processa a análise é:

/functions/v1/analyze-offer-index-ts

Ela faz:

1. Validação do token do usuário


2. Consumo de crédito


3. Scraping inteligente


4. Salva log no Supabase


5. Retorna resultado para o frontend




---

📊 Banco de Dados

Tabela: analysis_logs

Campo	Tipo

id	uuid
user_id	uuid
url	text
platform	text
price	numeric
risk_score	int
conversion_score	int
niche	text
raw_data	jsonb
created_at	timestamptz


Tabela: user_credits

Tabela: credit_transactions

RPCs:

consume_credits

perform_analysis_and_log

add_credits



---

📤 Exportação de Análises (Manual)

Crie um arquivo:

📌 src/utils/exportAnalysis.ts

import { supabase } from "../lib/supabaseClient";

export async function exportAnalysisHistory(userId: string) {
  const { data, error } = await supabase
    .from("analysis_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao exportar histórico", error);
    return null;
  }

  return data;
}

Como usar:

const history = await exportAnalysisHistory(user.id);

console.log("RELATÓRIO (JSON):", history);

Você pode baixar em JSON, CSV ou integrar com planilha.


---

📄 Gerar Relatório de Uma Análise

Crie:

📌 src/utils/getAnalysisDetail.ts

import { supabase } from "../lib/supabaseClient";

export async function getAnalysisDetail(id: string) {
  const { data, error } = await supabase
    .from("analysis_logs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao obter análise", error);
    return null;
  }

  return data;
}


---

📟 Logging do MVP

Em áreas críticas, adicione logs:

Login:

console.log("Login attempt:", email);

Análise:

console.log("Analyzing URL:", url);

Chamada de Edge Function:

console.log("Response from Edge Function:", result);

Erros:

console.error("API Error:", error);

Créditos:

console.log("Credits before:", balance);
console.log("Credits after:", newBalance);

Esses logs vão aparecer no console do Replit e podem ser vistos em tempo real.
