import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME_MS = 1 * 60 * 1000; // 1 minute warning before logout

export function IdleWarning() {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_TIME_MS);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | null>(null);

  // Reset idle timer on user activity
  const resetIdleTimer = () => {
    // Clear existing timers
    if (idleTimer) clearTimeout(idleTimer);
    if (warningTimer) clearTimeout(warningTimer);
    if (countdownTimer) clearTimeout(countdownTimer);
    if (showWarning) setShowWarning(false);

    setTimeLeft(WARNING_TIME_MS);

    // Set new idle timeout (trigger warning 1 min before logout)
    const newIdleTimer = setTimeout(() => {
      console.log("[IdleWarning] Idle timeout reached, showing warning");
      setShowWarning(true);
      setTimeLeft(WARNING_TIME_MS);

      // Start countdown
      let remaining = WARNING_TIME_MS;
      const newCountdownTimer = setInterval(() => {
        remaining -= 1000;
        setTimeLeft(Math.max(0, remaining));

        if (remaining <= 0) {
          clearInterval(newCountdownTimer);
          console.log("[IdleWarning] Warning time expired, logging out");
          handleLogout();
        }
      }, 1000);

      setCountdownTimer(newCountdownTimer);
    }, IDLE_TIMEOUT_MS);

    setIdleTimer(newIdleTimer);
  };

  const handleLogout = async () => {
    if (countdownTimer) clearInterval(countdownTimer);
    setShowWarning(false);
    await signOut();
  };

  const handleStayActive = () => {
    setShowWarning(false);
    resetIdleTimer();
  };

  useEffect(() => {
    if (!user) return;

    console.log("[IdleWarning] Setting up idle warning");

    // Initial setup
    resetIdleTimer();

    // Listen for user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      console.log("[IdleWarning] User activity detected");
      resetIdleTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      // Cleanup
      if (idleTimer) clearTimeout(idleTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);

      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);

  if (!showWarning) return null;

  const secondsLeft = Math.ceil(timeLeft / 1000);
  const minutesLeft = Math.ceil(secondsLeft / 60);

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="bg-[#0F1F1D] border border-red-500/30">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <AlertDialogTitle className="text-white">Sessão Expirada</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-300">
            Você ficou inativo por muito tempo. Será desconectado em {minutesLeft} minuto{minutesLeft !== 1 ? "s" : ""}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 text-center">
          <div className="text-3xl font-bold text-[#1BC1A1]">{secondsLeft}s</div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30">
            Desconectar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleStayActive} className="bg-[#1BC1A1] hover:bg-[#00927B] text-white">
            Continuar Ativo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
