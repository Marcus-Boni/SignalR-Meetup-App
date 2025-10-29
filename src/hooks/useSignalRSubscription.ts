import { useEffect, useRef } from "react";
import { useSignalRContext } from "../context/SignalRProvider";
import { HubConnectionState } from "@microsoft/signalr";

/**
 * Hook customizado para se inscrever em eventos do SignalR
 * 
 * @param hubUrl - URL do Hub SignalR
 * @param eventName - Nome do evento a escutar
 * @param callback - Função callback executada quando o evento é recebido
 * 
 * @example
 * useSignalRSubscription("/chatHub", "ReceiveMessage", (message: ChatMessage) => {
 *   console.log("Nova mensagem:", message);
 * });
 */
export const useSignalRSubscription = <T extends unknown[]>(
  hubUrl: string,
  eventName: string,
  callback: (...args: T) => void
) => {
  const { getConnection } = useSignalRContext();
  
  // Usa useRef para manter a referência estável do callback
  // Isso evita re-registrar o evento a cada render
  const callbackRef = useRef(callback);

  // Atualiza a ref sempre que o callback mudar
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const connection = getConnection(hubUrl);

    if (!connection) {
      console.warn(`⚠️ Conexão não encontrada para ${hubUrl}. Aguardando inicialização...`);
      return;
    }

    // Wrapper que usa a ref, garantindo que sempre usa a versão mais recente
    const eventHandler = (...args: T) => {
      callbackRef.current(...args);
    };

    // Função para registrar o evento
    const registerEvent = () => {
      // Remove listener anterior se existir (cleanup)
      connection.off(eventName, eventHandler);
      
      // Registra o listener
      connection.on(eventName, eventHandler);
      console.log(`👂 Inscrito no evento "${eventName}" do ${hubUrl}`);
    };

    // Se a conexão já está conectada, registra imediatamente
    if (connection.state === HubConnectionState.Connected) {
      registerEvent();
    }

    // Também registra quando a conexão for estabelecida (para casos de reconexão)
    const onReconnected = () => {
      console.log(`🔄 Reconectado - Re-registrando evento "${eventName}"`);
      registerEvent();
    };

    connection.onreconnected(onReconnected);

    // Tenta registrar imediatamente (caso a conexão esteja em processo)
    registerEvent();

    // CRÍTICO: Função de limpeza para evitar memory leaks
    return () => {
      connection.off(eventName, eventHandler);
      console.log(`🚫 Desinscrito do evento "${eventName}" do ${hubUrl}`);
    };
  }, [hubUrl, eventName, getConnection]);
};
