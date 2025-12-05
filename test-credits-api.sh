
#!/bin/bash

# Token obtido do último login bem-sucedido
TOKEN="eyJhbGciOiJIUzI1NiIsImtpZCI6IjN0djNMTi8zMjRVd3BoRzkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2NhcnRmanl3eXRhbHl6d3phanJyLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIzZDJmNWY2ZS02MmQ0LTRlNGQtOTE2OC02ZGQyNTdkZjA4OWMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY0MjY1OTEyLCJpYXQiOjE3NjQyNjIzMTIsImVtYWlsIjoiaHVnb3NhbnRhbmF2OUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiaHVnb3NhbnRhbmF2OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiSHVnbyIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiM2QyZjVmNmUtNjJkNC00ZTRkLTkxNjgtNmRkMjU3ZGYwODljIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjQyNjIzMTJ9XSwic2Vzc2lvbl9pZCI6ImRkYWVjOTFlLTlkODItNGFjZS1hZDdmLWM4NWJiMGJkNWYxMyIsImlzX2Fub255bW91cyI6ZmFsc2V9.OQUryKCERYWD0d50bNl26Rd4E8uZWK_nXYgs3v7ka0c"

echo "=============================="
echo "🧪 Testando API de Créditos"
echo "=============================="
echo ""

curl -X GET http://0.0.0.0:5000/api/credits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo "=============================="
