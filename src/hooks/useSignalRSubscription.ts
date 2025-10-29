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
  
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const connection = getConnection(hubUrl);

    if (!connection) {
      console.warn(`⚠️ Conexão não encontrada para ${hubUrl}. Aguardando inicialização...`);
      return;
    }

    const eventHandler = (...args: T) => {
      callbackRef.current(...args);
    };

    const registerEvent = () => {
      connection.off(eventName, eventHandler);
      
      connection.on(eventName, eventHandler);
      console.log(`👂 Inscrito no evento "${eventName}" do ${hubUrl}`);
    };

    if (connection.state === HubConnectionState.Connected) {
      registerEvent();
    }

    const onReconnected = () => {
      console.log(`🔄 Reconectado - Re-registrando evento "${eventName}"`);
      registerEvent();
    };

    connection.onreconnected(onReconnected);

    registerEvent();

    return () => {
      connection.off(eventName, eventHandler);
      console.log(`🚫 Desinscrito do evento "${eventName}" do ${hubUrl}`);
    };
  }, [hubUrl, eventName, getConnection]);
};
