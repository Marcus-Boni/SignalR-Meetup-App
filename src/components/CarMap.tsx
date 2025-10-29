"use client";

import { useState, useEffect, useRef } from "react";
import { useSignalRSubscription } from "../hooks/useSignalRSubscription";
import { HUB_URLS } from "../context/SignalRProvider";
import type { VehiclePosition } from "../types/signalr.d";

const WAYPOINTS = [
  { x: 50, y: 550, name: "🏪 Depósito", color: "#ff6b35" },
  { x: 250, y: 180, name: "🛒 Loja A", color: "#e85a2a" },
  { x: 550, y: 350, name: "🏬 Loja B", color: "#ff8c5a" },
  { x: 350, y: 520, name: "🏢 Loja C", color: "#d04920" },
];

const ROUTE_POINTS = [
  [50, 550], [50, 250], [150, 180], [250, 180],
  [450, 180], [550, 250], [550, 450], [450, 520],
  [350, 520], [150, 520], [50, 550]
];

const CarMap = () => {
  const [position, setPosition] = useState<VehiclePosition | null>(null);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; opacity: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useSignalRSubscription<[VehiclePosition]>(
    HUB_URLS.tracking,
    "ReceivePosition",
    (newPosition) => {
      console.log("📍 Nova posição:", newPosition);
      setPosition(newPosition);
      
      setTrail(prev => {
        const newTrail = [...prev, { x: newPosition.x, y: newPosition.y, opacity: 1 }];
        return newTrail.slice(-60);
      });
    }
  );

  useEffect(() => {
    if (!canvasRef.current || !position) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground(ctx, canvas.width, canvas.height);

      drawGrid(ctx, canvas.width, canvas.height);

      drawRoute(ctx);

      drawWaypoints(ctx);

      drawTrail(ctx, trail);

      drawVehicle(ctx, position);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [position, trail]);

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-2 sm:p-3 rounded-lg shadow border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">Status</p>
              <p className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-300 truncate">
                {position ? "Online" : "Aguardando"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-2 sm:p-3 rounded-lg shadow border-2 border-[#ff6b35]/30 dark:border-[#ff6b35]/50">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">🏁</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-[#e85a2a] dark:text-orange-400 font-medium">Velocidade</p>
              <p className="text-xs sm:text-sm font-bold text-[#ff6b35] dark:text-orange-300">
                {position ? `${Math.round(position.speed)} km/h` : "-- km/h"}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-linear-to-br p-2 sm:p-3 rounded-lg shadow border ${getStatusStyle(position?.status)}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">{getStatusIcon(position?.status)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium opacity-80">Status</p>
              <p className="text-xs sm:text-sm font-bold truncate">
                {position ? getStatusText(position.status) : "Aguardando"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-2 sm:p-3 rounded-lg shadow border-2 border-[#ff6b35]/30 dark:border-[#ff6b35]/50">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">📍</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-[#e85a2a] dark:text-orange-400 font-medium">Progresso</p>
              <p className="text-xs sm:text-sm font-bold text-[#ff6b35] dark:text-orange-300">
                {position ? `${position.routeProgress}%` : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-1 sm:-inset-2 bg-linear-to-r from-[#ff6b35] via-[#e85a2a] to-[#ff8c5a] rounded-xl sm:rounded-2xl opacity-20 blur-lg sm:blur-xl"></div>
        <div className="relative bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden border-2 border-[#ff6b35]/20 dark:border-[#ff6b35]/30">
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="absolute inset-0 w-full h-full"
            />

            {position && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/75 backdrop-blur-sm text-white p-2 sm:p-3 rounded-lg shadow-xl border border-white/20 text-xs sm:text-sm max-w-[140px] sm:max-w-40">
                <h3 className="font-bold text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1">
                  <span>📊</span>
                  <span className="hidden sm:inline">Telemetria</span>
                </h3>
                <div className="space-y-1 text-[10px] sm:text-xs">
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-gray-300 truncate">Vel:</span>
                    <span className="font-bold text-blue-400">{Math.round(position.speed)} km/h</span>
                  </div>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-gray-300 truncate">Dir:</span>
                    <span className="font-bold text-green-400">{Math.round(position.heading)}°</span>
                  </div>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-gray-300 truncate">Pos:</span>
                    <span className="font-bold text-yellow-400 text-[9px] sm:text-[10px]">
                      ({Math.round(position.x)},{Math.round(position.y)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-gray-300 truncate">Prog:</span>
                    <span className="font-bold text-purple-400">{position.routeProgress}%</span>
                  </div>
                  <div className="text-[9px] text-gray-400 pt-1 border-t border-gray-600 truncate">
                    {new Date(position.timestamp).toLocaleTimeString("pt-BR")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {position && (
        <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border-2 border-[#ff6b35]/20 dark:border-[#ff6b35]/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300">Progresso da Rota</h4>
            <span className="text-lg sm:text-xl font-bold text-[#ff6b35] dark:text-orange-400">
              {position.routeProgress}%
            </span>
          </div>
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 sm:h-6 overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-[#ff6b35] via-[#e85a2a] to-[#ff8c5a] rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${position.routeProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 mix-blend-difference">
                {position.routeProgress}% Completo
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-1 mt-3 text-[10px] sm:text-xs">
            {WAYPOINTS.map((wp, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mx-auto mb-1 shadow"
                  style={{ backgroundColor: wp.color }}
                ></div>
                <span className="text-gray-600 dark:text-gray-400 block truncate px-1">{wp.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-linear-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-2 sm:p-3 rounded-lg border-2 border-[#ff6b35]/30 dark:border-[#ff6b35]/50">
        <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <span className="font-bold text-[#ff6b35] dark:text-orange-400">🚗 Rastreamento em Tempo Real</span>
          <span className="hidden sm:inline"> • Sistema via SignalR WebSocket</span>
        </p>
      </div>
    </div>
  );
};

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fffbf5");    
  gradient.addColorStop(0.3, "#fff8f0"); 
  gradient.addColorStop(0.7, "#fff4eb");  
  gradient.addColorStop(1, "#ffefe6");   
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "#ffe4d6";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.4;

  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;
}

function drawRoute(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = "rgba(255, 107, 53, 0.15)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.strokeStyle = "#a89f94";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  
  ctx.moveTo(ROUTE_POINTS[0][0], ROUTE_POINTS[0][1]);
  for (let i = 1; i < ROUTE_POINTS.length; i++) {
    ctx.lineTo(ROUTE_POINTS[i][0], ROUTE_POINTS[i][1]);
  }
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#fff8f0";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([15, 10]);
  ctx.beginPath();
  
  ctx.moveTo(ROUTE_POINTS[0][0], ROUTE_POINTS[0][1]);
  for (let i = 1; i < ROUTE_POINTS.length; i++) {
    ctx.lineTo(ROUTE_POINTS[i][0], ROUTE_POINTS[i][1]);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawWaypoints(ctx: CanvasRenderingContext2D) {
  WAYPOINTS.forEach((wp, index) => {
    ctx.shadowColor = "rgba(255, 107, 53, 0.25)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = "#fffbf5";
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = wp.color;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((index + 1).toString(), wp.x, wp.y);

    ctx.shadowColor = "rgba(232, 90, 42, 0.4)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "#4a4a4a";  
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(wp.name.split(' ')[0], wp.x, wp.y - 20);
  });

  ctx.shadowColor = "transparent";
}

function drawTrail(ctx: CanvasRenderingContext2D, trail: Array<{ x: number; y: number; opacity: number }>) {
  if (trail.length < 2) return;

  trail.forEach((point, index) => {
    const opacity = (index / trail.length) * 0.4;
    const size = 2 + (index / trail.length) * 2;
    
    ctx.fillStyle = `rgba(255, 107, 53, ${opacity})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawVehicle(ctx: CanvasRenderingContext2D, position: VehiclePosition) {
  ctx.save();
  
  ctx.translate(position.x, position.y);
  ctx.rotate((position.heading * Math.PI) / 180);

  ctx.shadowColor = "rgba(255, 107, 53, 0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  const vehicleColor = getVehicleColor(position.status);
  ctx.fillStyle = vehicleColor;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fffbf5";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.shadowColor = "transparent";

  ctx.fillStyle = "#fffbf5";
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(-6, -8);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
  ctx.shadowBlur = 3;
  ctx.fillStyle = "#2a2a2a";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(position.speed)} km/h`, 0, -24);

  ctx.restore();
}

function getVehicleColor(status?: string): string {
  switch (status) {
    case "Moving": return "#ff6b35";   
    case "Stopped": return "#ef4444";   
    case "Accelerating": return "#10b981"; 
    case "Braking": return "#f59e0b";   
    default: return "#6b7280";          
  }
}

function getStatusStyle(status?: string): string {
  switch (status) {
    case "Moving":
      return "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300";
    case "Stopped":
      return "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300";
    case "Accelerating":
      return "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300";
    case "Braking":
      return "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300";
    default:
      return "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
  }
}

function getStatusIcon(status?: string): string {
  switch (status) {
    case "Moving": return "🚗";
    case "Stopped": return "🛑";
    case "Accelerating": return "⚡";
    case "Braking": return "🟡";
    default: return "⏳";
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case "Moving": return "Em Movimento";
    case "Stopped": return "Parado";
    case "Accelerating": return "Acelerando";
    case "Braking": return "Freando";
    default: return "Desconhecido";
  }
}

export default CarMap;