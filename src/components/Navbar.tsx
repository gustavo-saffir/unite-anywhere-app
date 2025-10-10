import { Button } from "@/components/ui/button";
import { BookOpen, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Caminho Diário</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-foreground hover:text-primary transition-colors font-medium">
              Recursos
            </a>
            <a href="#como-funciona" className="text-foreground hover:text-primary transition-colors font-medium">
              Como Funciona
            </a>
            <a href="#planos" className="text-foreground hover:text-primary transition-colors font-medium">
              Planos
            </a>
            <Button variant="outline" className="border-primary/30" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Link to="/auth">
              <Button className="bg-gradient-celestial hover:opacity-90 shadow-celestial">
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border/50">
            <a href="#recursos" className="block text-foreground hover:text-primary transition-colors font-medium">
              Recursos
            </a>
            <a href="#como-funciona" className="block text-foreground hover:text-primary transition-colors font-medium">
              Como Funciona
            </a>
            <a href="#planos" className="block text-foreground hover:text-primary transition-colors font-medium">
              Planos
            </a>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="w-full border-primary/30" asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
              <Link to="/auth" className="w-full">
                <Button className="w-full bg-gradient-celestial hover:opacity-90 shadow-celestial">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
