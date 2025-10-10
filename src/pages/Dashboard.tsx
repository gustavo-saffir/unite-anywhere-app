import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  CheckCircle2,
  Sparkles,
  MessageCircle
} from "lucide-react";
import bibleIcon from "@/assets/bible-icon.jpg";

const Dashboard = () => {
  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Bem-vindo de volta, João!</h1>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
            <Button variant="outline" className="border-primary/30">
              Ver Perfil
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Devotional Card */}
            <Card className="p-6 shadow-celestial border-primary/20 bg-card/90 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <img 
                  src={bibleIcon} 
                  alt="Devocional" 
                  className="w-16 h-16 rounded-xl shadow-glow"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <span className="text-sm font-semibold text-accent">Devocional de Hoje</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    A Fé que Move Montanhas
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    "Se você tiver fé do tamanho de um grão de mostarda..." - Mateus 17:20
                  </p>
                  <Button className="bg-gradient-celestial hover:opacity-90 shadow-celestial">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Iniciar Devocional
                  </Button>
                </div>
              </div>
            </Card>

            {/* Progress Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 hover:shadow-celestial transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary">45</span>
                </div>
                <p className="text-sm text-muted-foreground">Dias Consecutivos</p>
                <Progress value={75} className="mt-2 h-2" />
              </Card>

              <Card className="p-4 hover:shadow-celestial transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-2xl font-bold text-secondary">8</span>
                </div>
                <p className="text-sm text-muted-foreground">Badges Conquistadas</p>
                <Progress value={66} className="mt-2 h-2" />
              </Card>

              <Card className="p-4 hover:shadow-celestial transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-2xl font-bold text-accent">Nível 5</span>
                </div>
                <p className="text-sm text-muted-foreground">Discípulo Dedicado</p>
                <Progress value={80} className="mt-2 h-2" />
              </Card>
            </div>

            {/* Weekly Calendar */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Última Semana</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">{day}</div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      i < 5 
                        ? 'bg-gradient-celestial shadow-glow' 
                        : 'bg-muted'
                    }`}>
                      {i < 5 && <CheckCircle2 className="w-5 h-5 text-primary-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Spiritual Goals */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Objetivos Espirituais</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Leitura Bíblica</span>
                    <span className="text-muted-foreground">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Oração Diária</span>
                    <span className="text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Memorização</span>
                    <span className="text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 border-primary/30">
                Definir Novos Objetivos
              </Button>
            </Card>

            {/* Mentor Chat */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Mentor Virtual</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tem dúvidas sobre o devocional de hoje? Converse com seu mentor virtual 24/7!
              </p>
              <Button className="w-full bg-gradient-celestial hover:opacity-90">
                Iniciar Conversa
              </Button>
            </Card>

            {/* Recent Badges */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Conquistas Recentes</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-divine flex items-center justify-center">
                    <Award className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Semana Perfeita</p>
                    <p className="text-xs text-muted-foreground">7 dias consecutivos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Leitor Assíduo</p>
                    <p className="text-xs text-muted-foreground">30 devocionais completos</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
