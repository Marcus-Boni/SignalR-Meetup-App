import CarMap from "../../components/CarMap";
import { Wifi, Activity, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-linear-to-br from-[#ff6b35] to-[#e85a2a] rounded-2xl p-4 shadow-xl">
              <Wifi className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-3 bg-linear-to-r from-[#ff6b35] to-[#e85a2a] bg-clip-text text-transparent">
            Websockets
          </h1>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">
            Uma abordagem com SignalR
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Demonstração de comunicação em tempo real com .NET SignalR + Next.js
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff6b35]" />
              <span>Tempo Real</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ff6b35]" />
              <span>Comunicação Bidirecional</span>
            </div>
          </div>
        </header>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-2 border-[#ff6b35]/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-linear-to-br from-[#ff6b35] to-[#e85a2a] rounded-lg p-2">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-[#ff6b35] to-[#e85a2a] bg-clip-text text-transparent">
              Rastreamento de Veículo
            </h2>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            O veículo se move automaticamente e sincroniza em todas as abas abertas via WebSocket
          </p>
          <CarMap />
        </section>

        <footer className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-[#ff6b35]/20">
            <Wifi className="w-4 h-4 text-[#ff6b35]" />
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Meetup Optsolv • SignalR em Ação
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}