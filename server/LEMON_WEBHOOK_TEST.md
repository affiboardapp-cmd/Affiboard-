# Lemon Squeezy Webhook - Guia de Teste

## 📋 Resumo da Integração

- **Endpoint**: `POST /webhooks/lemon`
- **Produto**: 1129959 (R$ 19/mês - 100 análises)
- **Créditos**: +100 por compra
- **Validação**: HMAC-SHA256

## ✅ Checklist de Verificação

### 1. Secrets Configuradas
```bash
✓ LEMON_WEBHOOK_SECRET = [configurada]
✓ SUPABASE_SERVICE_ROLE_KEY = [configurada]
✓ SUPABASE_URL = [configurada]
```

### 2. Logs Esperados ao Receber Webhook

```
[LWS] HH:MM:SS | Webhook recebido
[LWS] HH:MM:SS | Assinatura validada
[LWS] HH:MM:SS | Evento: order_created | Produto: 1129959
[LWS] HH:MM:SS | Email extraído: user@example.com
[LWS] HH:MM:SS | User encontrado: user@example.com
[LWS] HH:MM:SS | Créditos atualizados: +100 (0 → 100)
```

### 3. Teste com cURL (Simulado)

```bash
# 1. Gerar assinatura HMAC-SHA256
SECRET="seu_lemon_webhook_secret"
PAYLOAD='{"meta":{"event":"order_created","product_id":1129959},"data":{"attributes":{"customer_email":"test@example.com"}}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# 2. Enviar webhook
curl -X POST http://localhost:5000/webhooks/lemon \
  -H "Content-Type: application/json" \
  -H "x-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

## 🔍 Estrutura do Payload (Lemon Squeezy)

```json
{
  "meta": {
    "event": "order_created | subscription_updated | subscription_resumed",
    "product_id": 1129959
  },
  "data": {
    "attributes": {
      "customer_email": "user@example.com"
    }
  }
}
```

## 📊 Flow Completo

1. **Lemon Squeezy** → Envia webhook para `/webhooks/lemon`
2. **Express Server** → Valida assinatura HMAC-SHA256
3. **Parse Payload** → Extrai email e evento
4. **Filtros**:
   - ✓ Product ID = 1129959?
   - ✓ Evento suportado (order_created, subscription_updated, subscription_resumed)?
   - ✓ Email válido?
5. **Supabase Query** → Busca usuário por email
6. **Atualização** → +100 créditos ao usuário
7. **Response** → 200 JSON com novo total de créditos

## ❌ Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `LEMON_WEBHOOK_SECRET not configured` | Secret não está no `.env` | Adicionar `LEMON_WEBHOOK_SECRET` aos secrets |
| `Invalid signature` | Assinatura não bate | Verificar se secret no Lemon = secret no servidor |
| `User not found` | Email no payload não existe em `profiles` | Criar usuário primeiro antes de testar |
| `Database error` | Problema ao conectar Supabase | Verificar `SUPABASE_SERVICE_ROLE_KEY` |

## 🚀 Deploy Checklist

- [ ] LEMON_WEBHOOK_SECRET configurada
- [ ] SUPABASE_SERVICE_ROLE_KEY configurada
- [ ] Webhook URL no Lemon = `https://seu-app.replit.dev/webhooks/lemon`
- [ ] Testar webhook no sandbox Lemon
- [ ] Verificar logs `[LWS]` no servidor
- [ ] Confirmar créditos adicionados em `profiles` table

## 📝 Logs de Sucesso

Você verá no console:
```
✓ [LWS] 14:30:45 | Webhook recebido
✓ [LWS] 14:30:45 | Assinatura validada
✓ [LWS] 14:30:45 | Evento: order_created | Produto: 1129959
✓ [LWS] 14:30:45 | Email extraído: user@example.com
✓ [LWS] 14:30:45 | User encontrado: user@example.com
✓ [LWS] 14:30:45 | Créditos atualizados: +100 (0 → 100)
```

**Response HTTP**: 
```json
{
  "success": true,
  "userId": "uuid-do-usuario",
  "creditsAdded": 100,
  "newTotal": 100
}
```
