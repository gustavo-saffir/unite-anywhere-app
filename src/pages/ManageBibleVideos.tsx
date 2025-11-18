import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CATEGORIES = {
  "Comentários Visuais": ["Sermão do Monte", "A Criação"],
  "Série": [
    "Os Sacerdotes Reais",
    "Temas Bíblicos",
    "Sermão do Monte",
    "Torá",
    "Seres Espirituais",
    "Sabedoria",
    "Caráter de Deus",
    "Palavras Negativas",
    "Como Ler a Bíblia",
    "Shema",
    "Advento",
    "Lucas -> Atos",
    "O Pentateuco",
    "Os Evangelhos",
    "Estudo de Palavras"
  ],
  "Panoramas": ["Antigo Testamento", "Novo Testamento"]
};

const ManageBibleVideos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Panoramas",
    subcategory: "Antigo Testamento",
    video_url: "",
    thumbnail_url: "",
    category_image_url: "",
    subcategory_image_url: "",
    duration_minutes: 5,
    description: "",
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['bible-videos-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('bible_videos')
        .insert([{
          title: data.title,
          category: data.category,
          subcategory: data.subcategory,
          video_url: data.video_url,
          thumbnail_url: data.thumbnail_url || null,
          category_image_url: data.category_image_url || null,
          subcategory_image_url: data.subcategory_image_url || null,
          duration_minutes: data.duration_minutes,
          description: data.description || null,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-videos-admin'] });
      toast.success('Vídeo adicionado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao adicionar vídeo: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from('bible_videos')
        .update({
          title: data.title,
          category: data.category,
          subcategory: data.subcategory,
          video_url: data.video_url,
          thumbnail_url: data.thumbnail_url || null,
          category_image_url: data.category_image_url || null,
          subcategory_image_url: data.subcategory_image_url || null,
          duration_minutes: data.duration_minutes,
          description: data.description || null,
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-videos-admin'] });
      toast.success('Vídeo atualizado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar vídeo: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bible_videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-videos-admin'] });
      toast.success('Vídeo excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir vídeo: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Panoramas",
      subcategory: "Antigo Testamento",
      video_url: "",
      thumbnail_url: "",
      category_image_url: "",
      subcategory_image_url: "",
      duration_minutes: 5,
      description: "",
    });
    setEditingVideo(null);
    setIsDialogOpen(false);
  };

  const convertToEmbedUrl = (url: string): string => {
    if (!url) return url;
    
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      video_url: convertToEmbedUrl(formData.video_url),
      duration_minutes: parseInt(formData.duration_minutes.toString()),
    };

    if (editingVideo) {
      updateMutation.mutate({ ...dataToSubmit, id: editingVideo.id });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      category: video.category,
      subcategory: video.subcategory,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || "",
      category_image_url: video.category_image_url || "",
      subcategory_image_url: video.subcategory_image_url || "",
      duration_minutes: video.duration_minutes,
      description: video.description || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Gerenciar Vídeos Bíblicos</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Vídeo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVideo ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Vídeo</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        category: value,
                        subcategory: CATEGORIES[value as keyof typeof CATEGORIES][0]
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CATEGORIES).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES[formData.category as keyof typeof CATEGORIES].map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="video_url">URL do Vídeo (YouTube)</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnail_url">URL da Thumbnail (opcional)</Label>
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="category_image_url">URL da Imagem da Categoria (opcional)</Label>
                  <Input
                    id="category_image_url"
                    type="url"
                    value={formData.category_image_url}
                    onChange={(e) => setFormData({ ...formData, category_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="subcategory_image_url">URL da Imagem da Subcategoria (opcional)</Label>
                  <Input
                    id="subcategory_image_url"
                    type="url"
                    value={formData.subcategory_image_url}
                    onChange={(e) => setFormData({ ...formData, subcategory_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingVideo ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Carregando vídeos...</div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <div className="relative aspect-video bg-muted rounded-md mb-2 overflow-hidden">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Upload className="h-12 w-12 text-primary" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Categoria:</strong> {video.category}</p>
                    <p><strong>Subcategoria:</strong> {video.subcategory}</p>
                    <p><strong>Duração:</strong> {video.duration_minutes} minutos</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(video)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este vídeo?')) {
                          deleteMutation.mutate(video.id);
                        }
                      }}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">Nenhum vídeo cadastrado ainda.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageBibleVideos;