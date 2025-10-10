import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus } from 'lucide-react';

const ManageChallenges = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_days: '',
    reward_type: 'xp',
    reward_value: '',
    category: '',
  });

  const categories = [
    'Vida Devocional',
    'Leitura Bíblica',
    'Relacionamento e Comunhão',
    'Oração e Jejum',
    'Missão e Evangelismo',
    'Serviço e Generosidade',
    'Caráter e Valores',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase.from('challenges').insert({
        title: formData.title,
        description: formData.description,
        duration_days: parseInt(formData.duration_days),
        reward_type: formData.reward_type,
        reward_value: formData.reward_value,
        category: formData.category,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Desafio criado com sucesso.',
      });

      setFormData({
        title: '',
        description: '',
        duration_days: '',
        reward_type: 'xp',
        reward_value: '',
        category: '',
      });
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o desafio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-celestial bg-clip-text text-transparent">
              Gerenciar Desafios
            </h1>
            <p className="text-muted-foreground">
              Crie novos desafios para os discípulos
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Desafio *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: 7 Dias de Intimidade"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o desafio e seus objetivos..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração (dias) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  placeholder="Ex: 7"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reward_type">Tipo de Recompensa *</Label>
                <Select
                  value={formData.reward_type}
                  onValueChange={(value) => setFormData({ ...formData, reward_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xp">Pontos XP</SelectItem>
                    <SelectItem value="medalha">Medalha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_value">
                  {formData.reward_type === 'xp' ? 'Quantidade de XP' : 'Nome da Medalha'} *
                </Label>
                <Input
                  id="reward_value"
                  value={formData.reward_value}
                  onChange={(e) => setFormData({ ...formData, reward_value: e.target.value })}
                  placeholder={formData.reward_type === 'xp' ? 'Ex: 100' : 'Ex: Constância em Oração'}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-celestial hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Desafio
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ManageChallenges;
