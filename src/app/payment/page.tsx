"use client";

import { useState } from "react";
import { useSignalRSubscription } from "../../hooks/useSignalRSubscription";
import { useSignalRInvoke } from "../../hooks/useSignalRInvoke";
import { HUB_URLS } from "../../context/SignalRProvider";
import type { PaymentStatus, PaymentRequest } from "../../types/signalr.d";

import { authService } from "../../services/authService";

// Função para gerar um ID único (UUID v4 simplificado)
const generateOrderId = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function PaymentPage() {
  // Estados
  const [amount, setAmount] = useState<string>("100.00");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook para invocar métodos no servidor
  const invoke = useSignalRInvoke(HUB_URLS.payment);

  // Inscrição para receber atualizações de status de pagamento
  useSignalRSubscription<[PaymentStatus]>(
    HUB_URLS.payment,
    "PaymentStatusUpdate",
    (status) => {
      console.log("💳 Atualização de status recebida:", status);
      console.log("📊 Status completo:", JSON.stringify(status, null, 2));
      setPaymentStatus(status);
      
      // Para de processar quando o pagamento for concluído ou falhar
      // O backend pode enviar: "Approved", "Completed", "Failed", "Rejected"
      const finalStatuses = ["Approved", "Completed", "Failed", "Rejected"];
      if (finalStatuses.includes(status.status)) {
        console.log("✅ Status final recebido, parando processamento");
        setIsProcessing(false);
      }
    }
  );

  // Handler: Submeter pagamento
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    try {
      // PASSO 1: Fazer requisição HTTP para iniciar o pagamento
      const paymentRequest: PaymentRequest = {
        orderId: newOrderId,
        amount: parseFloat(amount),
      };

      const response = await fetch("https://localhost:7279/api/payments/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      // Espera-se que o backend retorne 202 Accepted
      console.log("✅ Pagamento iniciado com sucesso. Status:", response.status);

      // PASSO 2: Inscrever-se para receber atualizações via SignalR
      await invoke("SubscribeToPaymentStatus", newOrderId);
      console.log(`📡 Inscrito para receber atualizações do pedido ${newOrderId}`);

      // Define o status inicial
      setPaymentStatus({
        orderId: newOrderId,
        status: "Pending",
        message: "Pagamento enviado. Aguardando processamento...",
      });
    } catch (err) {
      console.error("❌ Erro ao processar pagamento:", err);
      setError(
        err instanceof Error ? err.message : "Erro desconhecido ao processar pagamento"
      );
      setIsProcessing(false);
    }
  };

  // Handler: Resetar para novo pagamento
  const handleReset = () => {
    setOrderId(null);
    setPaymentStatus(null);
    setIsProcessing(false);
    setError(null);
  };

  // Função para determinar o ícone e cor do status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Pending":
        return { icon: "⏳", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-500" };
      case "Processing":
        return { icon: "⚙️", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-500" };
      case "Approved":
      case "Completed":
        return { icon: "✅", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-500" };
      case "Failed":
      case "Rejected":
        return { icon: "❌", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-500" };
      default:
        return { icon: "❓", color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30", border: "border-gray-500" };
    }
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-4xl font-bold mb-2">Gateway de Pagamento</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Simule um pagamento e acompanhe o status em tempo real
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {!orderId ? (
            // Formulário de Pagamento
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-2"
                >
                  Valor do Pagamento (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-lg font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isProcessing ? "Processando..." : "Realizar Pagamento"}
              </button>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ℹ️ Como Funciona
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>1. Você envia um pagamento (requisição HTTP)</li>
                  <li>2. O backend processa o pagamento de forma assíncrona</li>
                  <li>3. Você recebe atualizações em tempo real via SignalR</li>
                  <li>4. Veja o status mudar de Pending → Processing → Completed</li>
                </ul>
              </div>
            </form>
          ) : (
            // Área de Status do Pagamento
            <div>
              {/* Informações do Pedido */}
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Detalhes do Pedido
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">ID do Pedido</p>
                    <p className="font-mono text-xs break-all">{orderId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Valor</p>
                    <p className="font-semibold text-lg">R$ {parseFloat(amount).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Status do Pagamento */}
              {paymentStatus && (
                <div
                  className={`mb-6 p-6 ${getStatusDisplay(paymentStatus.status).bg} border-2 ${getStatusDisplay(paymentStatus.status).border} rounded-lg`}
                >
                  <div className="flex items-center mb-3">
                    <span className="text-4xl mr-3">
                      {getStatusDisplay(paymentStatus.status).icon}
                    </span>
                    <div>
                      <h3
                        className={`text-lg font-bold ${getStatusDisplay(paymentStatus.status).color}`}
                      >
                        Status: {paymentStatus.status}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {paymentStatus.message}
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso para estados de carregamento */}
                  {(paymentStatus.status === "Pending" || paymentStatus.status === "Processing") && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-blue-600 animate-progress-bar"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Erro */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg">
                  <h3 className="text-lg font-bold text-red-600 mb-2">❌ Erro</h3>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Botão para Novo Pagamento */}
              {!isProcessing && (
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Realizar Novo Pagamento
                </button>
              )}

              {/* Indicador de Processamento */}
              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Aguardando confirmação...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⚠️ Este é um simulador. Nenhuma transação real será processada.</p>
        </div>
      </div>

      {/* Estilo customizado para a barra de progresso */}
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress-bar {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
