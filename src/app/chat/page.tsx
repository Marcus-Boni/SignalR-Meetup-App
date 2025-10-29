"use client";

import { useState, useRef, useEffect } from "react";
import { useSignalRSubscription } from "../../hooks/useSignalRSubscription";
import { useSignalRInvoke } from "../../hooks/useSignalRInvoke";
import { HUB_URLS } from "../../context/SignalRProvider";
import { useAuth } from "../../hooks/useAuth";
import type { ChatMessage } from "../../types/signalr.d";

export default function ChatPage() {
  // Obtém o username real do JWT
  const { username: loggedUsername } = useAuth();
  
  // Estados
  const [roomName, setRoomName] = useState("");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Ref para auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook para invocar métodos no servidor
  const invoke = useSignalRInvoke(HUB_URLS.chat);

  // Inscrição para receber mensagens
  useSignalRSubscription<[ChatMessage]>(
    HUB_URLS.chat,
    "ReceiveMessage",
    (chatMessage) => {
      console.log("📩 Nova mensagem recebida:", chatMessage);
      setMessages((prev) => [...prev, chatMessage]);
    }
  );

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handler: Entrar na sala
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      console.log('🚪 Tentando entrar na sala...');
      console.log('  📍 Nome da sala:', roomName.trim());
      
      // Se já está em uma sala, sair dela primeiro
      if (currentRoom) {
        console.log('  🚶 Saindo da sala anterior:', currentRoom);
        await invoke("LeaveRoom", currentRoom);
        setMessages([]); // Limpa as mensagens da sala anterior
      }

      // Entrar na nova sala
      await invoke("JoinRoom", roomName.trim());
      setCurrentRoom(roomName.trim());
      setRoomName(""); // Limpa o input
      
      console.log('✅ Entrou na sala com sucesso!');
    } catch (error) {
      console.error("❌ Erro ao entrar na sala:", error);
      alert("Erro ao entrar na sala. Verifique o console.");
    }
  };

  // Handler: Sair da sala
  const handleLeaveRoom = async () => {
    if (!currentRoom) return;

    try {
      console.log('🚶 Saindo da sala:', currentRoom);
      await invoke("LeaveRoom", currentRoom);
      setCurrentRoom(null);
      setMessages([]);
      console.log('✅ Saiu da sala com sucesso!');
    } catch (error) {
      console.error("❌ Erro ao sair da sala:", error);
    }
  };

  // Handler: Enviar mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) return;

    try {
      console.log('📤 Enviando mensagem...');
      console.log('  📍 Sala:', currentRoom);
      console.log('  💬 Mensagem:', message.trim());
      
      // ✅ CORRETO: SendMessage espera apenas 2 parâmetros (roomName, message)
      // O username vem automaticamente do token JWT no backend
      await invoke("SendMessage", currentRoom, message.trim());
      
      setMessage(""); // Limpa o input
      console.log('✅ Mensagem enviada com sucesso!');
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Verifique o console.");
    }
  };

  // Interface principal do Chat
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">💬 Chat Multi-Sala</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Logado como: <span className="font-semibold">{loggedUsername || "Carregando..."}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar: Controle de Salas */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🚪 Salas</h2>

              {!currentRoom ? (
                <form onSubmit={handleJoinRoom}>
                  <div className="mb-4">
                    <label
                      htmlFor="roomName"
                      className="block text-sm font-medium mb-2"
                    >
                      Nome da Sala
                    </label>
                    <input
                      id="roomName"
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700"
                      placeholder="ex: sala-geral"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                    disabled={!roomName.trim()}
                  >
                    Entrar na Sala
                  </button>
                </form>
              ) : (
                <div>
                  <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                      Sala Atual
                    </p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                      {currentRoom}
                    </p>
                  </div>
                  <button
                    onClick={handleLeaveRoom}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Sair da Sala
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
                  💡 Dicas
                </h3>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Abra em múltiplas abas</li>
                  <li>• Entre na mesma sala</li>
                  <li>• Veja as mensagens sincronizarem!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Área Principal: Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-[600px]">
              {/* Área de Mensagens */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {!currentRoom ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">👈</div>
                      <p className="text-lg">Entre em uma sala para começar a conversar</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p>Nenhuma mensagem ainda. Seja o primeiro a falar!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    // Compara com o username do JWT
                    const isOwnMessage = msg.user === loggedUsername;
                    return (
                      <div
                        key={index}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1 opacity-75">
                            {msg.user}
                          </p>
                          <p className="text-sm wrap-break-word">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              {currentRoom && (
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                      placeholder="Digite sua mensagem..."
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!message.trim()}
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
