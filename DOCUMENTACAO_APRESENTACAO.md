# 📚 Documentação - WebSockets em Ação com SignalR

## 🎯 Visão Geral do Projeto

Esta aplicação demonstra comunicação em **tempo real** usando **WebSockets** através do **SignalR** (.NET) integrado com **Next.js 14** (React). 

O projeto contém **3 funcionalidades principais** que exemplificam diferentes casos de uso de comunicação bidirecional.

---

## 🏗️ Arquitetura Geral

### **Como Funciona a Comunicação**

```
┌─────────────┐         WebSocket         ┌─────────────┐
│   Frontend  │ ◄─────────────────────► │   Backend   │
│  (Next.js)  │      SignalR Hubs       │   (.NET)    │
└─────────────┘                          └─────────────┘
```

**Fluxo de Comunicação:**
1. **Cliente conecta** → Estabelece conexão WebSocket com o Hub
2. **Cliente se inscreve** → Ouve eventos específicos do servidor
3. **Servidor envia** → Notifica todos os clientes conectados em tempo real
4. **Cliente invoca** → Chama métodos no servidor via WebSocket

---

## 🧩 Componentes Principais

### **1. SignalRProvider** (`src/context/SignalRProvider.tsx`)

**O que faz:**
- Cria e gerencia **3 conexões persistentes** com o backend (uma para cada Hub)
- Mantém as conexões abertas durante toda a sessão
- Reconecta automaticamente se houver falha

**Hubs Configurados:**
- `trackingHub` → Rastreamento de veículos
- `chatHub` → Sistema de chat
- `paymentHub` → Pagamentos em tempo real

**Por que é importante:**
- Centraliza todas as conexões WebSocket em um único lugar
- Evita criar múltiplas conexões desnecessárias
- Garante que as conexões estejam prontas antes de usar

---

### **2. Hooks Customizados**

#### **useSignalRSubscription** (`src/hooks/useSignalRSubscription.ts`)

**O que faz:**
- Hook para **escutar eventos** vindos do servidor
- Gerencia automaticamente a inscrição e desinscrição

**Exemplo de uso:**
```typescript
useSignalRSubscription<[ChatMessage]>(
  HUB_URLS.chat,
  "ReceiveMessage",  // Nome do evento
  (message) => {
    // Callback executado quando mensagem chega
    console.log("Nova mensagem:", message);
  }
);
```

**Quando usar:** Para receber dados do servidor em tempo real

---

#### **useSignalRInvoke** (`src/hooks/useSignalRInvoke.ts`)

**O que faz:**
- Hook para **chamar métodos** no servidor via WebSocket
- Retorna uma função que pode invocar qualquer método do Hub

**Exemplo de uso:**
```typescript
const invoke = useSignalRInvoke(HUB_URLS.chat);

// Enviar mensagem
await invoke("SendMessage", "sala1", "Olá mundo!");
```

**Quando usar:** Para enviar comandos/dados para o servidor

---

## 📱 Telas da Aplicação

### **1. 🗺️ Tela de Rastreamento** (`/tracking`)

**O que demonstra:**
- Atualização de posição em tempo real de um veículo
- Sincronização automática entre múltiplas abas

**Como funciona:**

1. **Servidor:** Simula movimento de um veículo enviando posições a cada segundo
2. **Frontend:** Recebe as posições e atualiza o mapa instantaneamente

```typescript
// 👂 Ouve as atualizações de posição
useSignalRSubscription<[VehiclePosition]>(
  HUB_URLS.tracking,
  "ReceivePosition",  // Evento do servidor
  (newPosition) => {
    setPosition(newPosition);  // Atualiza UI
  }
);
```

**Dados recebidos:**
- `x, y` → Coordenadas no mapa
- `speed` → Velocidade do veículo
- `heading` → Direção (em graus)
- `status` → "Moving", "Stopped", "Accelerating", "Braking"
- `routeProgress` → Progresso na rota (%)

**Para demonstrar:**
1. Abra a tela `/tracking`
2. Abra em outra aba/navegador
3. Veja o carro se movendo **sincronizado** em todas as abas
4. Mostre os dados sendo atualizados em tempo real

---

### **2. 💬 Tela de Chat** (`/chat`)

**O que demonstra:**
- Chat multi-sala em tempo real
- Múltiplos usuários conversando simultaneamente

**Como funciona:**

1. **Entrar na sala:** Cliente envia comando para entrar em uma sala específica
2. **Enviar mensagem:** Cliente envia mensagem para a sala
3. **Receber mensagens:** Todos os usuários da sala recebem instantaneamente

```typescript
// 📤 Enviar mensagem (CLIENTE → SERVIDOR)
await invoke("SendMessage", roomName, messageText);

// 📩 Receber mensagem (SERVIDOR → CLIENTE)
useSignalRSubscription<[ChatMessage]>(
  HUB_URLS.chat,
  "ReceiveMessage",
  (message) => {
    setMessages(prev => [...prev, message]);  // Adiciona na lista
  }
);
```

**Métodos do Hub:**
- `JoinRoom(roomName)` → Entrar em uma sala
- `LeaveRoom(roomName)` → Sair da sala
- `SendMessage(roomName, message)` → Enviar mensagem

**Para demonstrar:**
1. Abra `/chat` em duas abas
2. Entre na **mesma sala** (ex: "sala-teste")
3. Envie uma mensagem em uma aba
4. Veja aparecer **instantaneamente** na outra aba
5. Mostre que cada usuário tem nome diferente (baseado no login)

---

### **3. 💳 Tela de Pagamento** (`/payment`)

**O que demonstra:**
- Processamento assíncrono com feedback em tempo real
- Combinação de HTTP + WebSocket

**Como funciona:**

1. **Cliente envia pagamento** → Via requisição HTTP POST
2. **Servidor processa** → De forma assíncrona (simula demora)
3. **Cliente recebe atualizações** → Via WebSocket sobre o status

```typescript
// 1️⃣ Envia pagamento via HTTP
await fetch("/api/payments/pay", {
  method: "POST",
  body: JSON.stringify({ orderId, amount })
});

// 2️⃣ Inscreve-se para receber atualizações via WebSocket
await invoke("SubscribeToPaymentStatus", orderId);

// 3️⃣ Recebe atualizações de status em tempo real
useSignalRSubscription<[PaymentStatus]>(
  HUB_URLS.payment,
  "PaymentStatusUpdate",
  (status) => {
    // Status vai mudando: Pending → Processing → Completed
    setPaymentStatus(status);
  }
);
```

**Fluxo de Status:**
```
Pending → Processing → Approved → Completed
                   ↓
                 Failed/Rejected
```

**Para demonstrar:**
1. Abra `/payment`
2. Digite um valor (ex: R$ 100,00)
3. Clique em "Realizar Pagamento"
4. Mostre o status mudando automaticamente
5. Explique que o servidor está processando e enviando atualizações

---

## 🔐 Sistema de Autenticação

### **Como funciona:**

**Login** (`/login`):
- Usuário envia credenciais
- Backend retorna um **JWT Token**
- Token é salvo no `localStorage`

**Proteção de rotas** (`middleware.ts`):
- Toda rota exceto `/login` exige autenticação
- Se não tiver token, redireciona para login

**SignalR com Token:**
```typescript
new signalR.HubConnectionBuilder()
  .withUrl(hubUrl, {
    accessTokenFactory: () => getAccessToken()  // Envia token em cada conexão
  })
```

**Credenciais de teste:**
```
username: admin
password: password123
```

---

## 🚀 Fluxo de Inicialização

### **O que acontece quando o app carrega:**

1. **Layout raiz** (`src/app/layout.tsx`):
   - Envolve toda aplicação com `<SignalRProvider>`

2. **SignalRProvider** inicia:
   - Conecta nos 3 Hubs simultaneamente
   - Aguarda todas as conexões estarem prontas
   - Define `isReady = true`

3. **Componentes** podem usar:
   - `useSignalRSubscription` → Para ouvir eventos
   - `useSignalRInvoke` → Para chamar métodos

---

## 🎓 Conceitos Importantes para Explicar

### **1. WebSocket vs HTTP Tradicional**

| HTTP Tradicional | WebSocket |
|-----------------|-----------|
| Cliente pergunta → Servidor responde | Conexão permanente bidirecional |
| Precisa fazer polling (ficar perguntando) | Servidor envia quando há novidade |
| Mais requisições = mais overhead | Uma conexão, muitas mensagens |

### **2. SignalR - Abstração sobre WebSockets**

**O que o SignalR facilita:**
- ✅ Reconexão automática se cair a conexão
- ✅ Fallback para outros transportes (Server-Sent Events, Long Polling)
- ✅ Gerenciamento de grupos/salas
- ✅ Serialização automática de objetos

### **3. Padrão Pub/Sub (Publisher/Subscriber)**

**Chat é um exemplo clássico:**
- **Publisher:** Cliente que envia mensagem
- **Subscriber:** Todos os clientes ouvindo na sala
- **Hub:** Intermediário que distribui as mensagens

---

## 📊 Demonstração Sugerida

### **Ordem recomendada de demonstração:**

1. **Mostrar a estrutura do código** (5 min)
   - `SignalRProvider` → O "coração" das conexões
   - Hooks customizados → Simplificam o uso
   
2. **Demo: Rastreamento** (5 min)
   - Abra em 2 abas
   - Mostre sincronização do carro
   - Destaque dados em tempo real

3. **Demo: Chat** (7 min)
   - Entre em uma sala
   - Envie mensagens de múltiplas abas
   - Explique o conceito de "sala" no SignalR

4. **Demo: Pagamento** (5 min)
   - Faça um pagamento
   - Mostre status mudando automaticamente
   - Explique a combinação HTTP + WebSocket

5. **Q&A e Conceitos** (3 min)
   - Vantagens do WebSocket
   - Casos de uso reais
   - Comparação com polling

---

## 💡 Pontos-Chave para Mencionar

### **Vantagens do SignalR:**
- ✅ Comunicação bidirecional instantânea
- ✅ Gerenciamento automático de conexões
- ✅ Suporte a grupos e broadcast
- ✅ Reconexão transparente

### **Quando usar WebSockets:**
- 📊 Dashboards em tempo real
- 💬 Chats e notificações
- 🎮 Jogos multiplayer
- 📍 Rastreamento de localização
- 📈 Feeds de dados ao vivo (ações, criptomoedas)

### **Considerações:**
- ⚠️ Manter conexões abertas consome recursos
- ⚠️ Precisa planejar escalabilidade (usar Redis Backplane)
- ⚠️ Testar reconexões em casos de falha

---

## 🔧 Executando o Projeto

### **Pré-requisitos:**
```bash
# Backend: .NET 8.0
# Frontend: Node.js 18+
```

### **Iniciar:**

**Backend:**
```bash
cd Backend
dotnet run
# Roda em: https://localhost:7279
```

**Frontend:**
```bash
cd FrontEnd/car-tracking
npm install
npm run dev
# Roda em: http://localhost:3000
```

### **Login:**
```
Username: admin
Password: password123
```

---

## 📝 Checklist para Apresentação

- [ ] Backend rodando e acessível
- [ ] Frontend rodando
- [ ] Testar login antes
- [ ] Ter 2 navegadores/abas prontos
- [ ] Limpar console para logs limpos
- [ ] Preparar exemplos de mensagens do chat
- [ ] Ter o código aberto no VS Code

---

## 🎤 Frases-Chave para Usar

> "Aqui vemos a comunicação **bidirecional em tempo real** - o servidor pode enviar dados sem o cliente precisar pedir"

> "O **SignalR abstrai toda a complexidade** dos WebSockets, nos dando uma API simples para trabalhar"

> "Reparem que abri em **duas abas diferentes** e estão **sincronizadas automaticamente** - isso é o poder do WebSocket"

> "No modelo tradicional HTTP, o cliente teria que ficar **fazendo polling** a cada segundo. Com WebSocket, o servidor **envia quando há novidade**"

> "Este padrão **Pub/Sub** é muito usado em sistemas modernos - quem se inscreve recebe as atualizações automaticamente"

---

## 📚 Recursos Adicionais

**Documentação:**
- [SignalR .NET](https://learn.microsoft.com/aspnet/core/signalr/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr)

**Casos de uso reais:**
- WhatsApp Web, Slack → Chat
- Google Docs → Colaboração em tempo real
- Uber → Rastreamento de corridas
- Trading platforms → Cotações ao vivo

---

## 🎯 Resumo Final

### **Arquitetura:**
```
SignalRProvider (gerencia conexões)
    ↓
useSignalRSubscription (escuta eventos)
useSignalRInvoke (chama métodos)
    ↓
Componentes React (UI)
```

### **3 Demos Principais:**
1. 🗺️ **Tracking** → Broadcast para todos os clientes
2. 💬 **Chat** → Comunicação em grupos (salas)
3. 💳 **Payment** → Atualizações direcionadas (por orderId)

### **Mensagem Principal:**
> WebSockets com SignalR permitem criar aplicações **verdadeiramente em tempo real**, proporcionando uma **experiência superior** ao usuário sem a necessidade de polling constante.

---

**Boa apresentação! 🚀**
