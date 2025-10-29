"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { authService } from "../services/authService";
import * as signalR from "@microsoft/signalr";

interface SignalRContextValue {
  getConnection: (hubUrl: string) => signalR.HubConnection | undefined;
  isReady: boolean; 
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

export const useSignalRContext = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalRContext deve ser usado dentro de um SignalRProvider");
  }
  return context;
};

const HUB_URLS = {
  tracking: "https://localhost:7279/trackingHub",
  chat: "https://localhost:7279/chatHub",
  payment: "https://localhost:7279/paymentHub",
} as const;

const getAccessToken = (): string => {
  return authService.getToken() || "";
};

interface SignalRProviderProps {
  children: ReactNode;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const connectionsRef = useRef<Map<string, signalR.HubConnection>>(new Map());
  const isInitializedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const connections = connectionsRef.current;

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
              if (retryContext.elapsedMilliseconds < 60000) {
                return Math.random() * 10000;
              } else {
                return null; 
              }
            },
          })
          .configureLogging(signalR.LogLevel.Information)
          .build();

        connection.onreconnecting((error) => {
          console.warn(`🔄 Reconectando ao ${hubUrl}...`, error);
        });

        connection.onreconnected((connectionId) => {
          console.log(`✅ Reconectado ao ${hubUrl}. ConnectionId: ${connectionId}`);
        });

        connection.onclose((error) => {
          console.error(`❌ Conexão fechada: ${hubUrl}`, error);
        });

        await connection.start();
        console.log(`🚀 Conectado ao ${hubUrl}`);

        connections.set(hubUrl, connection);
      } catch (error) {
        console.error(`❌ Erro ao conectar no ${hubUrl}:`, error);
      }
    };

    const initializeConnections = async () => {
      await Promise.all([
        createConnection(HUB_URLS.tracking),
        createConnection(HUB_URLS.chat),
        createConnection(HUB_URLS.payment),
      ]);
      
      setIsReady(true);
      console.log("✅ Todas as conexões SignalR estão prontas!");
    };

    initializeConnections();

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

export { HUB_URLS };
