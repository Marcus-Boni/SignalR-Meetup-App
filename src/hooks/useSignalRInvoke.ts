import { useCallback } from "react";
import { useSignalRContext } from "../context/SignalRProvider";

/**
 * Hook customizado para invocar métodos no servidor via SignalR
 * 
 * @param hubUrl - URL do Hub SignalR
 * 
 * @returns Função invoke que pode chamar qualquer método do Hub
 * 
 * @example
 * const invoke = useSignalRInvoke("/chatHub");
 * 
 * // Uso:
 * await invoke("SendMessage", "sala1", "Olá!");
 */
export const useSignalRInvoke = (hubUrl: string) => {
  const { getConnection } = useSignalRContext();

  /**
   * Invoca um método no servidor
   * @param methodName - Nome do método no Hub do servidor
   * @param args - Argumentos para passar ao método
   */
  const invoke = useCallback(
    async <T = void>(methodName: string, ...args: unknown[]): Promise<T> => {
      const connection = getConnection(hubUrl);

      if (!connection) {
        const error = `❌ Conexão não encontrada para ${hubUrl}`;
        console.error(error);
        throw new Error(error);
      }

      try {
        console.log(`📤 Invocando "${methodName}" no ${hubUrl}`, args);
        const result = await connection.invoke<T>(methodName, ...args);
        console.log(`✅ "${methodName}" executado com sucesso`);
        return result;
      } catch (error) {
        console.error(`❌ Erro ao invocar "${methodName}":`, error);
        throw error;
      }
    },
    [hubUrl, getConnection]
  );

  return invoke;
};
