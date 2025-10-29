"use client";

import { useState, useRef } from "react";
import { useSignalRSubscription } from "../../hooks/useSignalRSubscription";
import { useSignalRInvoke } from "../../hooks/useSignalRInvoke";
import { HUB_URLS } from "../../context/SignalRProvider";
import { useAuth } from "../../hooks/useAuth";
import type { ChatMessage } from "../../types/signalr.d";
import { MessageCircle, Send, LogIn, LogOut, Lightbulb, Users, Mail } from "lucide-react";

export default function ChatPage() {
  const { username: loggedUsername } = useAuth();
  
  const [roomName, setRoomName] = useState("");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const invoke = useSignalRInvoke(HUB_URLS.chat);

  useSignalRSubscription<[ChatMessage]>(
    HUB_URLS.chat,
    "ReceiveMessage",
    (chatMessage) => {
      console.log("📩 Nova mensagem recebida:", chatMessage);
      setMessages((prev) => [...prev, chatMessage]);
    }
  );

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      console.log('🚪 Tentando entrar na sala...');
      console.log('  📍 Nome da sala:', roomName.trim());
      
      if (currentRoom) {
        console.log('  🚶 Saindo da sala anterior:', currentRoom);
        await invoke("LeaveRoom", currentRoom);
        setMessages([]); 
      }

      await invoke("JoinRoom", roomName.trim());
      setCurrentRoom(roomName.trim());
      setRoomName(""); 
      
      console.log('✅ Entrou na sala com sucesso!');
    } catch (error) {
      console.error("❌ Erro ao entrar na sala:", error);
      alert("Erro ao entrar na sala. Verifique o console.");
    }
  };

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) return;

    try {
      console.log('📤 Enviando mensagem...');
      console.log('  📍 Sala:', currentRoom);
      console.log('  💬 Mensagem:', message.trim());
      
      await invoke("SendMessage", currentRoom, message.trim());
      
      setMessage("");
      console.log('✅ Mensagem enviada com sucesso!');
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Verifique o console.");
    }
  };

  return (
    <main className="min-h-screen dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-linear-to-br from-[#ff6b35] to-[#e85a2a] rounded-2xl p-3 shadow-xl">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-[#ff6b35] to-[#e85a2a] bg-clip-text text-transparent mb-2">
            Chat Multi-Sala
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Logado como: <span className="font-semibold text-[#ff6b35]">{loggedUsername || "Carregando..."}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-[#ff6b35]/20">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#ff6b35]" />
                <h2 className="text-xl font-bold">Salas</h2>
              </div>

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
                    className="w-full bg-linear-to-r from-[#ff6b35] to-[#e85a2a] hover:from-[#e85a2a] hover:to-[#d04920] text-white font-semibold py-2 rounded-lg transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={!roomName.trim()}
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar na Sala
                  </button>
                </form>
              ) : (
                <div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-[#ff6b35] rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-[#e85a2a] dark:text-orange-300 mb-1">
                      Sala Atual
                    </p>
                    <p className="text-lg font-bold text-[#ff6b35] dark:text-orange-200">
                      {currentRoom}
                    </p>
                  </div>
                  <button
                    onClick={handleLeaveRoom}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Sala
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[#ff6b35]" />
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Dicas
                  </h3>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Abra em múltiplas abas</li>
                  <li>• Entre na mesma sala</li>
                  <li>• Veja as mensagens sincronizarem!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col h-[600px] border-2 border-[#ff6b35]/20">
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {!currentRoom ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <LogIn className="w-16 h-16 mx-auto mb-4 text-[#ff6b35]" />
                      <p className="text-lg">Entre em uma sala para começar a conversar</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Mail className="w-16 h-16 mx-auto mb-4 text-[#ff6b35]" />
                      <p>Nenhuma mensagem ainda. Seja o primeiro a falar!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwnMessage = msg.user === loggedUsername;
                    return (
                      <div
                        key={index}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${
                            isOwnMessage
                              ? "bg-linear-to-r from-[#ff6b35] to-[#e85a2a] text-white"
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
                      className="bg-linear-to-r from-[#ff6b35] to-[#e85a2a] hover:from-[#e85a2a] hover:to-[#d04920] text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={!message.trim()}
                    >
                      <Send className="w-4 h-4" />
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
