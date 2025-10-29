import CarMap from "../../components/CarMap";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Demonstração .NET SignalR + Next.js
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Aplicação de tempo real com múltiplas funcionalidades
          </p>
        </header>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* ...existing code... */}
        </div>

        {/* Feature atual: Car Tracking */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">
            🚗 Rastreamento de Veículo
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            O carrinho se move automaticamente e sincroniza em todas as abas abertas
          </p>
          <CarMap />
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Desenvolvido com ❤️ usando Next.js 14, SignalR e Tailwind CSS
          </p>
        </footer>
      </div>
    </main>
  );
}