import { SignalRProvider } from "../../context/SignalRProvider";
import Navigation from "../../components/Navigation";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SignalRProvider>
        <Navigation />
        {children}
      </SignalRProvider>
    </ProtectedRoute>
  );
}
