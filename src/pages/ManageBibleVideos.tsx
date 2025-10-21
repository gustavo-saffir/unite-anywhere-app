import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ManageBibleVideos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    book_name: "",
    book_order: "",
    testament: "",
    video_url: "",
    thumbnail_url: "",
    duration_minutes: "5",
    description: "",
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['bible-videos-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_videos')
        .select('*')
        .order('book_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('bible_videos').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-videos-admin'] });
      toast.success("Vídeo adicionado com sucesso!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar vídeo: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('bible_videos').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-videos-admin'] });
      toast.success("Vídeo atualizado com sucesso!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar vídeo: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bible_videos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-videos-admin'] });
      toast.success("Vídeo removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover vídeo: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      book_name: "",
      book_order: "",
      testament: "",
      video_url: "",
      thumbnail_url: "",
      duration_minutes: "5",
      description: "",
    });
    setEditingVideo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      book_order: parseInt(formData.book_order),
      duration_minutes: parseInt(formData.duration_minutes),
    };

    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      book_name: video.book_name,
      book_order: video.book_order.toString(),
      testament: video.testament,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || "",
      duration_minutes: video.duration_minutes.toString(),
      description: video.description || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Vídeos Bíblicos</h1>
              <p className="text-muted-foreground">Adicione e gerencie resumos dos livros da Bíblia</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Vídeo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVideo ? "Editar Vídeo" : "Novo Vídeo"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="book_name">Nome do Livro *</Label>
                    <Input
                      id="book_name"
                      value={formData.book_name}
                      onChange={(e) => setFormData({ ...formData, book_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="book_order">Ordem *</Label>
                    <Input
                      id="book_order"
                      type="number"
                      value={formData.book_order}
                      onChange={(e) => setFormData({ ...formData, book_order: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="testament">Testamento *</Label>
                  <Select value={formData.testament} onValueChange={(value) => setFormData({ ...formData, testament: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o testamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Antigo">Antigo Testamento</SelectItem>
                      <SelectItem value="Novo">Novo Testamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="video_url">URL do Vídeo (YouTube embed ou similar) *</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnail_url">URL da Miniatura (opcional)</Label>
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="duration_minutes">Duração (minutos) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingVideo ? "Atualizar" : "Adicionar"} Vídeo
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Carregando vídeos...</div>
        ) : videos && videos.length > 0 ? (
          <div className="grid gap-4">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{video.book_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {video.testament} Testamento • Ordem: {video.book_order} • {video.duration_minutes} min
                      </p>
                      {video.description && (
                        <p className="text-sm text-muted-foreground mt-2">{video.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o vídeo "{video.book_name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(video.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
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
