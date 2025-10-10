import { CheckCircle2 } from "lucide-react";

const WhatIs = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              O que é o Caminho Diário?
            </h2>
          </div>

          <div className="space-y-8 text-lg text-muted-foreground">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-foreground">
                O Problema que Resolvemos
              </h3>
              <p>
                Muitos cristãos lutam com um <strong className="text-foreground">discipulado desorganizado</strong> e 
                sem acompanhamento. Falta estrutura, falta motivação e falta clareza sobre o progresso espiritual real.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-foreground">
                Nossa Solução
              </h3>
              <p>
                O <strong className="text-primary">Caminho Diário</strong> é um sistema completo de crescimento espiritual que 
                combina devocionais estruturados, acompanhamento pastoral e tecnologia de ponta para transformar 
                sua jornada de fé em algo <strong className="text-foreground">mensurável, motivador e real</strong>.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">5-10 minutos por dia</h4>
                  <p className="text-sm text-muted-foreground">Crescimento consistente sem sobrecarregar sua rotina</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Acompanhamento real</h4>
                  <p className="text-sm text-muted-foreground">Seu líder vê seu progresso e pode te apoiar melhor</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Progresso visível</h4>
                  <p className="text-sm text-muted-foreground">Veja sua evolução com níveis, XP e conquistas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIs;
