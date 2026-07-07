# SpotNICK Frontend

Frontend React para SpotNICK - Sistema de Gerenciamento de WiFi.

## 🎯 Recursos

- ✅ Login e Registro de usuários
- ✅ Dashboard completo
- ✅ Gerenciamento de Pagamentos (PIX, Boleto, Cartão)
- ✅ Perfil de usuário
- ✅ Autenticação com JWT
- ✅ Integração com backend
- ✅ Design responsivo com Tailwind CSS

## 📦 Setup Rápido

### 1. Clonar e instalar

```bash
# Clonar repositório
git clone https://github.com/seu_usuario/spotNICK-frontend.git
cd spotNICK-frontend

# Instalar dependências
npm install
```

### 2. Configurar .env

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

**Edite `.env`:**
```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Rodar localmente

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## 🚀 Deploy em Vercel

### 1. Push para GitHub

```bash
git add .
git commit -m "Frontend SpotNICK completo"
git push origin main
```

### 2. Conectar em Vercel

- Abra [vercel.com](https://vercel.com)
- Clique em "New Project"
- Selecione `spotNICK-frontend` do GitHub
- Clique em "Import"

### 3. Adicionar Variáveis de Ambiente

Em **Settings → Environment Variables**, adicione:

```
VITE_API_URL=https://seu-backend-railway.railway.app
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Deploy

Clique em **Deploy** e pronto! ✅

## 📁 Estrutura

```
src/
├── components/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Pagamentos.jsx
│   └── Perfil.jsx
├── hooks/
│   └── useAuth.js
├── services/
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🎨 Cores SpotNICK

- **Azul Primário:** `#0052CC`
- **Cyan:** `#00D4FF`
- **Ouro:** `#FFB700`
- **Rosa:** `#FF006E`
- **Escuro:** `#0A1828`
- **Claro:** `#F5F5F5`

## 🔗 Endpoints Esperados

Backend precisa ter estes endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/payments/estimate`
- `POST /api/payments/checkout`
- `GET /api/payments/charges`

## 📝 Notas

- O frontend usa JWT para autenticação
- Tokens são salvos em localStorage
- API URL pode ser diferente em produção
- Certifique-se de que o backend está online

## 🤝 Suporte

Dúvidas? Abra uma issue no GitHub!

---

**SpotNICK © 2026** - Sistema de Gerenciamento de WiFi
