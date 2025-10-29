"use client";

import { useState } from "react";
import { useSignalRSubscription } from "../../hooks/useSignalRSubscription";
import { useSignalRInvoke } from "../../hooks/useSignalRInvoke";
import { HUB_URLS } from "../../context/SignalRProvider";
import type { PaymentStatus, PaymentRequest } from "../../types/signalr.d";
import { authService } from "../../services/authService";
import { CreditCard, DollarSign, CheckCircle, XCircle, Clock, Loader2, RefreshCw, Info } from "lucide-react";

const generateOrderId = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function PaymentPage() {
  const [amount, setAmount] = useState<string>("100.00");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoke = useSignalRInvoke(HUB_URLS.payment);

  useSignalRSubscription<[PaymentStatus]>(
    HUB_URLS.payment,
    "PaymentStatusUpdate",
    (status) => {
      console.log("💳 Atualização de status recebida:", status);
      console.log("📊 Status completo:", JSON.stringify(status, null, 2));
      setPaymentStatus(status);
      
      const finalStatuses = ["Approved", "Completed", "Failed", "Rejected"];
      if (finalStatuses.includes(status.status)) {
        console.log("✅ Status final recebido, parando processamento");
        setIsProcessing(false);
      }
    }
  );

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    try {
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

      console.log("✅ Pagamento iniciado com sucesso. Status:", response.status);

      await invoke("SubscribeToPaymentStatus", newOrderId);
      console.log(`📡 Inscrito para receber atualizações do pedido ${newOrderId}`);

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

  const handleReset = () => {
    setOrderId(null);
    setPaymentStatus(null);
    setIsProcessing(false);
    setError(null);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Pending":
        return { 
          icon: Clock, 
          color: "text-yellow-600", 
          bg: "bg-yellow-100 dark:bg-yellow-900/30", 
          border: "border-yellow-500" 
        };
      case "Processing":
        return { 
          icon: Loader2, 
          color: "text-[#ff6b35]", 
          bg: "bg-orange-100 dark:bg-orange-900/30", 
          border: "border-[#ff6b35]" 
        };
      case "Approved":
      case "Completed":
        return { 
          icon: CheckCircle, 
          color: "text-green-600", 
          bg: "bg-green-100 dark:bg-green-900/30", 
          border: "border-green-500" 
        };
      case "Failed":
      case "Rejected":
        return { 
          icon: XCircle, 
          color: "text-red-600", 
          bg: "bg-red-100 dark:bg-red-900/30", 
          border: "border-red-500" 
        };
      default:
        return { 
          icon: Info, 
          color: "text-gray-600", 
          bg: "bg-gray-100 dark:bg-gray-900/30", 
          border: "border-gray-500" 
        };
    }
  };

  return (
    <main className="min-h-screen dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-linear-to-br from-[#ff6b35] to-[#e85a2a] rounded-2xl p-4 shadow-xl">
              <CreditCard className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-[#ff6b35] to-[#e85a2a] bg-clip-text text-transparent mb-2">
            Gateway de Pagamento
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Simule um pagamento e acompanhe o status em tempo real via WebSocket
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-2 border-[#ff6b35]/20">
          {!orderId ? (
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-2"
                >
                  Valor do Pagamento (R$)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-[#ff6b35]" />
                  </div>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent bg-white dark:bg-gray-700 text-lg font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="w-full bg-linear-to-r from-[#ff6b35] to-[#e85a2a] hover:from-[#e85a2a] hover:to-[#d04920] text-white font-bold py-4 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {isProcessing ? "Processando..." : "Realizar Pagamento"}
              </button>

              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-[#ff6b35]/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-[#ff6b35]" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Como Funciona
                  </h3>
                </div>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>1. Você envia um pagamento (requisição HTTP)</li>
                  <li>2. O backend processa o pagamento de forma assíncrona</li>
                  <li>3. Você recebe atualizações em tempo real via SignalR</li>
                  <li>4. Veja o status mudar de Pending → Processing → Completed</li>
                </ul>
              </div>
            </form>
          ) : (
            <div>
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

              {paymentStatus && (
                <div
                  className={`mb-6 p-6 ${getStatusDisplay(paymentStatus.status).bg} border-2 ${getStatusDisplay(paymentStatus.status).border} rounded-lg`}
                >
                  <div className="flex items-center mb-3">
                    <div className="mr-3">
                      {(() => {
                        const IconComponent = getStatusDisplay(paymentStatus.status).icon;
                        return <IconComponent className={`w-10 h-10 ${getStatusDisplay(paymentStatus.status).color} ${paymentStatus.status === "Processing" ? "animate-spin" : ""}`} />;
                      })()}
                    </div>
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

                  {(paymentStatus.status === "Pending" || paymentStatus.status === "Processing") && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-linear-to-r from-[#ff6b35] to-[#e85a2a] animate-progress-bar"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg">
                  <h3 className="text-lg font-bold text-red-600 mb-2">❌ Erro</h3>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {!isProcessing && (
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Realizar Novo Pagamento
                </button>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin h-8 w-8 text-[#ff6b35]" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Aguardando confirmação...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⚠️ Este é um simulador. Nenhuma transação real será processada.</p>
        </div>
      </div>

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
