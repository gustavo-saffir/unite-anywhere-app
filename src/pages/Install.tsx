import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Share, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Detectar Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Listener para evento de instalação (Chrome/Android)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('App instalado com sucesso!');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Instalar Caminho Diário</h1>
            <p className="text-muted-foreground">Acesse o app direto da tela inicial do seu celular</p>
          </div>
        </div>

        {/* Android - Instalação automática */}
        {isInstallable && isAndroid && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-6 w-6 text-primary" />
                Instalação Rápida (Android)
              </CardTitle>
              <CardDescription>
                Clique no botão abaixo para instalar o app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleInstallClick} 
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Instalar Agora
              </Button>
            </CardContent>
          </Card>
        )}

        {/* iOS - Instruções manuais */}
        {isIOS && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                Instalação no iPhone/iPad
              </CardTitle>
              <CardDescription>
                Siga os passos abaixo para adicionar o app à tela inicial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Abra o menu de compartilhamento</p>
                  <p className="text-sm text-muted-foreground">
                    Toque no ícone <Share className="inline h-4 w-4" /> (Compartilhar) na barra inferior do Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Adicionar à Tela de Início</p>
                  <p className="text-sm text-muted-foreground">
                    Role para baixo e toque em "Adicionar à Tela de Início" <Home className="inline h-4 w-4" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Confirme a instalação</p>
                  <p className="text-sm text-muted-foreground">
                    Toque em "Adicionar" no canto superior direito
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg mt-6">
                <p className="text-sm font-medium mb-2">💡 Importante:</p>
                <p className="text-sm text-muted-foreground">
                  Esta funcionalidade só está disponível no navegador Safari. Se você estiver usando outro navegador, abra este link no Safari primeiro.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Android - Instruções manuais */}
        {isAndroid && !isInstallable && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                Instalação no Android
              </CardTitle>
              <CardDescription>
                Siga os passos abaixo para adicionar o app à tela inicial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Abra o menu do navegador</p>
                  <p className="text-sm text-muted-foreground">
                    Toque nos três pontos (⋮) no canto superior direito do Chrome
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Adicionar à tela inicial</p>
                  <p className="text-sm text-muted-foreground">
                    Selecione "Adicionar à tela inicial" ou "Instalar app"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Confirme a instalação</p>
                  <p className="text-sm text-muted-foreground">
                    Toque em "Adicionar" ou "Instalar" para confirmar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Desktop ou outros dispositivos */}
        {!isIOS && !isAndroid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                Instalação em Dispositivos Móveis
              </CardTitle>
              <CardDescription>
                Acesse este site no seu celular para instalar o app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Para instalar o Caminho Diário como um aplicativo, acesse este site no navegador do seu celular (Safari no iPhone ou Chrome no Android) e siga as instruções que aparecerão.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Benefícios */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Por que instalar?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-muted-foreground">
                <strong>Acesso rápido:</strong> Abra o app direto da tela inicial, como um app nativo
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-muted-foreground">
                <strong>Funciona offline:</strong> Acesse seu conteúdo mesmo sem internet
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-muted-foreground">
                <strong>Notificações:</strong> Receba lembretes dos seus devocionais diários
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-muted-foreground">
                <strong>Experiência completa:</strong> Interface otimizada sem as barras do navegador
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
