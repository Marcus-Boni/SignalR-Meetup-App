"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { authService } from "../services/authService";
import * as signalR from "@microsoft/signalr";

// Tipo do contexto
interface SignalRContextValue {
  getConnection: (hubUrl: string) => signalR.HubConnection | undefined;
  isReady: boolean; // Novo: indica se as conexões estão prontas
}

// Criação do Contexto
const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

// Hook para acessar o contexto
export const useSignalRContext = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalRContext deve ser usado dentro de um SignalRProvider");
  }
  return context;
};

// Configuração dos Hubs
const HUB_URLS = {
  tracking: "https://localhost:7279/trackingHub",
  chat: "https://localhost:7279/chatHub",
  payment: "https://localhost:7279/paymentHub",
} as const;

// Função simulada para obter o token JWT
// Em produção, isso viria de um serviço de autenticação
const getAccessToken = (): string => {
  // Usa o token real do authService
  return authService.getToken() || "";
};

interface SignalRProviderProps {
  children: ReactNode;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  // Armazena as conexões em um Map (hubUrl -> HubConnection)
  const connectionsRef = useRef<Map<string, signalR.HubConnection>>(new Map());
  const isInitializedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Previne dupla inicialização (React Strict Mode)
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const connections = connectionsRef.current;

    // Função para criar e iniciar uma conexão
    const createConnection = async (hubUrl: string) => {
      try {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => getAccessToken(),
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              // Estratégia de retry exponencial
              if (retryContext.elapsedMilliseconds < 60000) {
                return Math.random() * 10000;
              } else {
                return null; // Para de tentar após 1 minuto
              }
            },
          })
          .configureLogging(signalR.LogLevel.Information)
          .build();

        // Event handlers para o ciclo de vida da conexão
        connection.onreconnecting((error) => {
          console.warn(`🔄 Reconectando ao ${hubUrl}...`, error);
        });

        connection.onreconnected((connectionId) => {
          console.log(`✅ Reconectado ao ${hubUrl}. ConnectionId: ${connectionId}`);
        });

        connection.onclose((error) => {
          console.error(`❌ Conexão fechada: ${hubUrl}`, error);
        });

        // Inicia a conexão
        await connection.start();
        console.log(`🚀 Conectado ao ${hubUrl}`);

        // Armazena a conexão no Map
        connections.set(hubUrl, connection);
      } catch (error) {
        console.error(`❌ Erro ao conectar no ${hubUrl}:`, error);
        // Em produção, você pode querer implementar retry manual aqui
      }
    };

    // Cria conexões para todos os Hubs
    const initializeConnections = async () => {
      await Promise.all([
        createConnection(HUB_URLS.tracking),
        createConnection(HUB_URLS.chat),
        createConnection(HUB_URLS.payment),
      ]);
      
      // Marca como pronto após todas as conexões serem estabelecidas
      setIsReady(true);
      console.log("✅ Todas as conexões SignalR estão prontas!");
    };

    initializeConnections();

    // Cleanup: Para todas as conexões quando o Provider é desmontado
    return () => {
      console.log("🧹 Limpando conexões SignalR...");
      connections.forEach((connection, hubUrl) => {
        connection
          .stop()
          .then(() => console.log(`🛑 Conexão ${hubUrl} encerrada`))
          .catch((err) => console.error(`Erro ao parar ${hubUrl}:`, err));
      });
      connections.clear();
    };
  }, []);

  // Método para obter uma conexão específica
  const getConnection = (hubUrl: string): signalR.HubConnection | undefined => {
    return connectionsRef.current.get(hubUrl);
  };

  const value: SignalRContextValue = {
    getConnection,
    isReady,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

// Exporta as URLs dos Hubs para uso nos hooks
export { HUB_URLS };
