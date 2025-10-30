# 🚀 SignalR Real-Time Application

Uma aplicação **enterprise-grade** de demonstração que implementa comunicação em tempo real usando **.NET SignalR** e **Next.js 16** (App Router) com **TypeScript**.

![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![SignalR](https://img.shields.io/badge/SignalR-9.0.6-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-cyan)

---

## ✨ Features

### 🚗 **Car Tracking**
Rastreamento de veículo em tempo real com sincronização perfeita entre múltiplas instâncias.

### 💬 **Chat Multi-Sala**
Sistema completo de chat com:
- Múltiplas salas
- Sincronização em tempo real
- UI moderna e responsiva

### 💳 **Gateway de Pagamento Simulado**
Demonstração de pagamento assíncrono com:
- Requisição HTTP
- Atualizações via SignalR
- Estados visuais (Pending → Processing → Completed)

---

## 🏗️ Arquitetura

Este projeto foi arquitetado por um **Senior Frontend Architect** seguindo todas as melhores práticas do mercado:

- ✅ **Provider Pattern** - Gerenciamento centralizado de conexões SignalR
- ✅ **Custom Hooks** - Abstração completa da biblioteca SignalR
- ✅ **TypeScript Strict** - 100% tipado
- ✅ **Separation of Concerns** - Context, Hooks, Components, Pages
- ✅ **Clean Code** - SOLID principles aplicados
- ✅ **Memory Leak Prevention** - Cleanup adequado em todos os useEffect

### Estrutura de Arquivos

```
src/
├── app/                  # Rotas (Next.js App Router)
│   ├── layout.tsx       # Layout raiz com Providers
│   ├── page.tsx         # Home page
│   ├── chat/           # Página do Chat
│   └── payment/        # Página de Pagamento
├── components/          # Componentes React
│   ├── CarMap.tsx      # Rastreamento de veículo
│   └── Navigation.tsx  # Navegação global
├── context/            # React Context
│   └── SignalRProvider.tsx  # Provider de conexões SignalR
├── hooks/              # Custom Hooks
│   ├── useSignalRSubscription.ts  # Hook para eventos
│   └── useSignalRInvoke.ts        # Hook para métodos
└── types/              # TypeScript Definitions
    └── signalr.d.ts    # DTOs
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Backend .NET rodando em `https://localhost:7279`

### Instalação

```bash
# Clonar o repositório (ou navegar até a pasta)
cd car-tracking

# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🎯 Funcionalidades Detalhadas

### 1. Car Tracking (`/`)

```typescript
// Uso do hook customizado
useSignalRSubscription<[Position]>(
  HUB_URLS.tracking,
  "ReceivePosition",
  (newPosition) => setPosition(newPosition)
);
```

**Testes:**
- Abra em múltiplas abas
- Observe o carrinho sincronizar automaticamente

---

### 2. Chat Multi-Sala (`/chat`)

```typescript
// Entrar em sala
const invoke = useSignalRInvoke(HUB_URLS.chat);
await invoke("JoinRoom", "sala-geral");

// Enviar mensagem
await invoke("SendMessage", roomName, username, message);

// Receber mensagens
useSignalRSubscription<[ChatMessage]>(
  HUB_URLS.chat,
  "ReceiveMessage",
  (msg) => setMessages(prev => [...prev, msg])
);
```

**Testes:**
1. Entre em uma sala
2. Abra em outra aba com username diferente
3. Entre na mesma sala
4. Envie mensagens e veja a sincronização

---

### 3. Gateway de Pagamento (`/payment`)

**Fluxo Híbrido (HTTP + SignalR):**

```typescript
// 1. HTTP POST para iniciar pagamento
const response = await fetch("/api/payments/pay", {
  method: "POST",
  body: JSON.stringify({ orderId, amount })
});

// 2. Inscrever-se via SignalR
await invoke("SubscribeToPaymentStatus", orderId);

// 3. Receber atualizações em tempo real
useSignalRSubscription<[PaymentStatus]>(
  HUB_URLS.payment,
  "PaymentStatusUpdate",
  (status) => setPaymentStatus(status)
);
```

**Testes:**
1. Digite um valor
2. Clique em "Realizar Pagamento"
3. Observe o status mudando: Pending → Processing → Completed

---

## 🔧 Tecnologias

### Core
- **Next.js 16** - React Framework com App Router
- **React 19** - Biblioteca UI
- **TypeScript 5** - Type Safety
- **@microsoft/signalr 9** - Real-time communication

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- Dark mode support nativo
- Animações e transições suaves

### Arquitetura
- **React Context API** - Estado global
- **Custom Hooks** - Lógica reutilizável
- **TypeScript Generics** - Type-safe abstractions

---

## 🧪 Testing

### Comandos

```bash
# Lint
npm run lint

# Build (valida TypeScript)
npm run build

# Start (após build)
npm start
```

### Roadmap de Testes

- [ ] Unit tests (Jest + React Testing Library)
- [ ] Integration tests
- [ ] E2E tests (Playwright)

---

## 📊 Performance

### Otimizações Implementadas

- ✅ Code splitting automático (Next.js)
- ✅ `useCallback` para estabilidade de funções
- ✅ `useRef` evita re-subscriptions
- ✅ Cleanup previne memory leaks
- ✅ Server Components onde possível

### Métricas Esperadas

- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.5s

---

## 🐛 Troubleshooting

### Conexão não estabelece
1. Verifique se o backend está rodando
2. Cheque o console (F12) para erros
3. Confirme as URLs dos Hubs em `src/context/SignalRProvider.tsx`

### Mensagens não sincronizam
1. Certifique-se de estar na mesma sala
2. Verifique CORS no backend
3. Confira logs do SignalR no console

### Erros de Build
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 🤝 Contribuindo

Este é um projeto de demonstração, mas sugestões são bem-vindas!

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---
**Desenvolvido com ❤️ usando Next.js, SignalR e Tailwind CSS**
