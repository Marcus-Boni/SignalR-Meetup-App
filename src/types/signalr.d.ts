// DTOs do Frontend - Espelhando o Backend
export interface Position {
  x: number;
  y: number;
}

// Formato de rastreamento de veículos
export interface VehiclePosition {
  x: number;              // Posição X (0-800)
  y: number;              // Posição Y (0-600)
  speed: number;          // Velocidade em km/h (0-60)
  heading: number;        // Direção em graus (0-360)
  status: "Moving" | "Stopped" | "Accelerating" | "Braking";
  timestamp: string;      // ISO timestamp
  routeProgress: number;  // Progresso da rota (0-100%)
}

export interface ChatMessage {
  user: string;
  message: string;
  roomName: string;
  timestamp?: string;
}

export interface PaymentStatus {
  orderId: string;
  status: string;
  message: string;
  timestamp?: string;
  amount?: number; 
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
}
