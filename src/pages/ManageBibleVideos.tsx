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
import { ArrowLeft, Plus, Pencil, Trash2, Video, FolderTree } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ManageBibleVideos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [videoFormData, setVideoFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    video_url: "",
    thumbnail_url: "",
    duration_minutes: 5,
    description: "",
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    parent_id: "",
    image_url: "",
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['video-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
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

  // Get only parent categories (main categories)
  const mainCategories = categories?.filter(cat => !cat.parent_id) || [];
  
  // Get subcategories for selected category
  const subcategories = categories?.filter(cat => cat.parent_id === categoryFormData.parent_id) || [];
  
  // Get subcategories for selected video category
  const videoSubcategories = categories?.filter(cat => {
    const mainCat = categories?.find(c => c.name === videoFormData.category && !c.parent_id);
    return mainCat && cat.parent_id === mainCat.id;
  }) || [];

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof categoryFormData) => {
      const { error } = await supabase
        .from('video_categories')
        .insert([{
          name: data.name,
          parent_id: data.parent_id || null,
          image_url: data.image_url || null,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-categories'] });
      toast.success('Categoria criada com sucesso!');
      resetCategoryForm();
    },
    onError: (error) => {
      toast.error('Erro ao criar categoria: ' + error.message);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: typeof categoryFormData & { id: string }) => {
      const { error } = await supabase
        .from('video_categories')
        .update({
          name: data.name,
          parent_id: data.parent_id || null,
          image_url: data.image_url || null,
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-categories'] });
      toast.success('Categoria atualizada com sucesso!');
      resetCategoryForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar categoria: ' + error.message);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('video_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-categories'] });
      toast.success('Categoria excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir categoria: ' + error.message);
    },
  });

  // Video mutations
  const createVideoMutation = useMutation({
    mutationFn: async (data: typeof videoFormData) => {
      const { error } = await supabase
        .from('bible_videos')
        .insert([{
          title: data.title,
          category: data.category,
          subcategory: data.subcategory,
          video_url: data.video_url,
          thumbnail_url: data.thumbnail_url || null,
          duration_minutes: data.duration_minutes,
          description: data.description || null,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-videos-admin'] });
      toast.success('Vídeo adicionado com sucesso!');
      resetVideoForm();
    },
    onError: (error) => {
      toast.error('Erro ao adicionar vídeo: ' + error.message);
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async (data: typeof videoFormData & { id: string }) => {
      const { error } = await supabase
        .from('bible_videos')
        .update({
          title: data.title,
          category: data.category,
          subcategory: data.subcategory,
          video_url: data.video_url,
          thumbnail_url: data.thumbnail_url || null,
          duration_minutes: data.duration_minutes,
          description: data.description || null,
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-videos-admin'] });
      toast.success('Vídeo atualizado com sucesso!');
      resetVideoForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar vídeo: ' + error.message);
    },
  });

  const deleteVideoMutation = useMutation({
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

  const resetVideoForm = () => {
    setVideoFormData({
      title: "",
      category: "",
      subcategory: "",
      video_url: "",
      thumbnail_url: "",
      duration_minutes: 5,
      description: "",
    });
    setEditingVideo(null);
    setIsVideoDialogOpen(false);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      parent_id: "",
      image_url: "",
    });
    setEditingCategory(null);
    setIsCategoryDialogOpen(false);
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

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...videoFormData,
      video_url: convertToEmbedUrl(videoFormData.video_url),
      duration_minutes: parseInt(videoFormData.duration_minutes.toString()),
    };

    if (editingVideo) {
      updateVideoMutation.mutate({ ...dataToSubmit, id: editingVideo.id });
    } else {
      createVideoMutation.mutate(dataToSubmit);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      updateCategoryMutation.mutate({ ...categoryFormData, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(categoryFormData);
    }
  };

  const handleEditVideo = (video: any) => {
    setEditingVideo(video);
    setVideoFormData({
      title: video.title,
      category: video.category,
      subcategory: video.subcategory,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || "",
      duration_minutes: video.duration_minutes,
      description: video.description || "",
    });
    setIsVideoDialogOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      parent_id: category.parent_id || "",
      image_url: category.image_url || "",
    });
    setIsCategoryDialogOpen(true);
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
          
          <div className="flex gap-2">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => resetCategoryForm()}>
                  <FolderTree className="h-4 w-4 mr-2" />
                  Gerenciar Categorias
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoria' : 'Adicionar Categoria/Subcategoria'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cat-name">Nome da Categoria/Subcategoria</Label>
                    <Input
                      id="cat-name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      placeholder="Ex: Panoramas"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="parent-category">Categoria Pai (deixe vazio para criar categoria principal)</Label>
                    <Select
                      value={categoryFormData.parent_id}
                      onValueChange={(value) => setCategoryFormData({ ...categoryFormData, parent_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma (Categoria Principal)</SelectItem>
                        {mainCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Se selecionar uma categoria pai, esta será uma subcategoria
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="cat-image">URL da Imagem de Capa (opcional)</Label>
                    <Input
                      id="cat-image"
                      type="url"
                      value={categoryFormData.image_url}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Resolução recomendada: 600x800 pixels
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={resetCategoryForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>

                {/* List existing categories */}
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-semibold mb-4">Categorias Existentes</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {isLoadingCategories ? (
                      <p className="text-sm text-muted-foreground">Carregando...</p>
                    ) : mainCategories.length > 0 ? (
                      mainCategories.map((cat) => (
                        <div key={cat.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{cat.name}</p>
                              {cat.image_url && (
                                <p className="text-xs text-muted-foreground">Com imagem</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCategory(cat)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Tem certeza? Isso excluirá todas as subcategorias também.')) {
                                    deleteCategoryMutation.mutate(cat.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Show subcategories */}
                          {categories?.filter(sub => sub.parent_id === cat.id).map((subcat) => (
                            <div key={subcat.id} className="ml-4 mt-2 p-2 bg-muted rounded flex items-center justify-between">
                              <div>
                                <p className="text-sm">{subcat.name}</p>
                                {subcat.image_url && (
                                  <p className="text-xs text-muted-foreground">Com imagem</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCategory(subcat)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Tem certeza que deseja excluir esta subcategoria?')) {
                                      deleteCategoryMutation.mutate(subcat.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma categoria criada ainda.</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetVideoForm()}>
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
                <form onSubmit={handleVideoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título do Vídeo</Label>
                    <Input
                      id="title"
                      value={videoFormData.title}
                      onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={videoFormData.category}
                      onValueChange={(value) => {
                        setVideoFormData({ 
                          ...videoFormData, 
                          category: value,
                          subcategory: ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {mainCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategoria</Label>
                    <Select
                      value={videoFormData.subcategory}
                      onValueChange={(value) => setVideoFormData({ ...videoFormData, subcategory: value })}
                      disabled={!videoFormData.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {videoSubcategories.map((subcat) => (
                          <SelectItem key={subcat.id} value={subcat.name}>{subcat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="video_url">URL do Vídeo (YouTube)</Label>
                    <Input
                      id="video_url"
                      type="url"
                      value={videoFormData.video_url}
                      onChange={(e) => setVideoFormData({ ...videoFormData, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="thumbnail_url">URL da Thumbnail (opcional)</Label>
                    <Input
                      id="thumbnail_url"
                      type="url"
                      value={videoFormData.thumbnail_url}
                      onChange={(e) => setVideoFormData({ ...videoFormData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se não informado, será usado ícone de vídeo
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duração (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={videoFormData.duration_minutes}
                      onChange={(e) => setVideoFormData({ ...videoFormData, duration_minutes: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={videoFormData.description}
                      onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={resetVideoForm}>
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
        </div>

        {isLoadingVideos ? (
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
                        <Video className="h-12 w-12 text-primary" />
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
                      onClick={() => handleEditVideo(video)}
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
                          deleteVideoMutation.mutate(video.id);
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