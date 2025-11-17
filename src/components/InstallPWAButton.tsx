import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  if (!isInstallable) return null;

  return (
    <Button
      onClick={handleInstallClick}
      size="lg"
      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
    >
      <Download className="w-5 h-5" />
      Instalar App
    </Button>
  );
};

export default InstallPWAButton;
