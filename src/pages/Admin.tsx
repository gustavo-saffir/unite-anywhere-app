import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Users, BookOpen, LogOut, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <Settings className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestão da Plataforma</h2>
            <p className="text-muted-foreground">
              Gerencie usuários, devocionais, desafios e mensagens
            </p>
          </div>

          {/* Admin Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/manage-users">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <Users className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Gerenciar Usuários</h3>
                <p className="text-muted-foreground">
                  Visualize e gerencie os usuários da plataforma
                </p>
              </Card>
            </Link>

            <Link to="/create-devotional">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <BookOpen className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Criar Devocionais</h3>
                <p className="text-muted-foreground">
                  Crie e gerencie os devocionais diários
                </p>
              </Card>
            </Link>

            <Link to="/manage-challenges">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <Target className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Gerenciar Desafios</h3>
                <p className="text-muted-foreground">
                  Crie e gerencie desafios espirituais
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
