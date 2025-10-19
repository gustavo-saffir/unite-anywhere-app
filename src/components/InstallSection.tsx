import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Apple, Share, MoreVertical, Download, Home } from 'lucide-react';

export default function InstallSection() {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Instale o App na Tela Inicial
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Adicione o Caminho Diário à tela inicial do seu celular para ter acesso rápido e uma experiência completa como um aplicativo nativo.
          </p>
        </div>

        <Tabs value={platform} onValueChange={(v) => setPlatform(v as 'android' | 'ios')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="android" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Android
            </TabsTrigger>
            <TabsTrigger value="ios" className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              iOS (iPhone)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="android">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Como Instalar no Android
                </CardTitle>
                <CardDescription>
                  Siga os passos abaixo para adicionar o app à sua tela inicial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Abra o Menu do Navegador</h3>
                      <p className="text-sm text-muted-foreground">
                        No <strong>Chrome</strong> ou <strong>Edge</strong>, toque no ícone de três pontos (⋮) no canto superior direito.
                      </p>
                      <div className="mt-2 p-3 bg-muted rounded-lg flex items-center gap-2">
                        <MoreVertical className="w-5 h-5" />
                        <span className="text-sm">Procure pelo ícone de três pontos verticais</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Selecione a Opção de Instalação</h3>
                      <p className="text-sm text-muted-foreground">
                        Procure e toque em uma destas opções:
                      </p>
                      <ul className="mt-2 space-y-2">
                        <li className="p-2 bg-muted rounded flex items-center gap-2">
                          <Download className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">"Instalar app"</span>
                        </li>
                        <li className="p-2 bg-muted rounded flex items-center gap-2">
                          <Home className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">"Adicionar à tela inicial"</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Confirme a Instalação</h3>
                      <p className="text-sm text-muted-foreground">
                        Toque em <strong>"Instalar"</strong> ou <strong>"Adicionar"</strong> na mensagem que aparecer.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-green-600 dark:text-green-400">Pronto!</h3>
                      <p className="text-sm text-muted-foreground">
                        O ícone do Caminho Diário agora está na sua tela inicial. Toque nele para abrir o app.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>💡 Dica:</strong> Após instalar, você pode receber notificações e usar o app offline!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ios">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-primary" />
                  Como Instalar no iPhone (iOS)
                </CardTitle>
                <CardDescription>
                  Siga os passos abaixo para adicionar o app à sua tela inicial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Abra no Safari</h3>
                      <p className="text-sm text-muted-foreground">
                        <strong>Importante:</strong> Esta instalação só funciona no <strong>Safari</strong>. Se estiver usando Chrome, abra o link no Safari.
                      </p>
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          🧭 Use o navegador Safari (ícone azul com bússola)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Toque no Botão Compartilhar</h3>
                      <p className="text-sm text-muted-foreground">
                        Na barra inferior do Safari, toque no ícone de compartilhar.
                      </p>
                      <div className="mt-2 p-3 bg-muted rounded-lg flex items-center gap-2">
                        <Share className="w-5 h-5" />
                        <span className="text-sm">Procure pelo ícone de compartilhar (quadrado com seta para cima)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Selecione "Adicionar à Tela de Início"</h3>
                      <p className="text-sm text-muted-foreground">
                        Role a lista de opções e toque em:
                      </p>
                      <div className="mt-2 p-3 bg-muted rounded-lg flex items-center gap-2">
                        <Home className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">"Adicionar à Tela de Início"</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Confirme e Adicione</h3>
                      <p className="text-sm text-muted-foreground">
                        Toque em <strong>"Adicionar"</strong> no canto superior direito.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-green-600 dark:text-green-400">Pronto!</h3>
                      <p className="text-sm text-muted-foreground">
                        O ícone do Caminho Diário agora está na sua tela inicial. Toque nele para abrir o app.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>💡 Dica:</strong> Para receber notificações no iPhone:
                  </p>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 ml-4">
                    <li>• Requer iOS 16.4 ou superior</li>
                    <li>• Abra o app pela tela inicial (não pelo Safari)</li>
                    <li>• Ative as notificações quando solicitado</li>
                    <li>• Vá em Ajustes → Notificações → Caminho Diário e habilite</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>⚠️ Limitação do iOS:</strong> Notificações push no iPhone têm limitações e podem não funcionar em todos os casos, mesmo seguindo todos os passos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
