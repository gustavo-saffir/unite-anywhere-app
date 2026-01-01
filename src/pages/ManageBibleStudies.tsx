import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TextEditor } from '@/components/TextEditor';
import { ArrowLeft, Plus, Edit, Trash2, FolderPlus, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface StudyCategory {
  id: string;
  name: string;
  parent_id: string | null;
  image_url: string | null;
}

interface BibleStudy {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category_id: string | null;
  subcategory_id: string | null;
  image_url: string | null;
  created_at: string;
}

const ManageBibleStudies = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [studyDialogOpen, setStudyDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StudyCategory | null>(null);
  const [editingStudy, setEditingStudy] = useState<BibleStudy | null>(null);
  
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    parent_id: '',
    image_url: '',
  });
  
  const [studyFormData, setStudyFormData] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    subcategory_id: '',
    image_url: '',
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['study-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as StudyCategory[];
    },
  });

  // Fetch studies
  const { data: studies = [] } = useQuery({
    queryKey: ['bible-studies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BibleStudy[];
    },
  });

  const mainCategories = categories.filter(c => !c.parent_id);
  const subcategories = categories.filter(c => c.parent_id);
  
  const getSubcategoriesForCategory = (categoryId: string) => {
    return categories.filter(c => c.parent_id === categoryId);
  };

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof categoryFormData) => {
      const { error } = await supabase.from('study_categories').insert({
        name: data.name,
        parent_id: data.parent_id || null,
        image_url: data.image_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-categories'] });
      toast.success('Categoria criada com sucesso!');
      resetCategoryForm();
    },
    onError: () => toast.error('Erro ao criar categoria'),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof categoryFormData }) => {
      const { error } = await supabase.from('study_categories').update({
        name: data.name,
        parent_id: data.parent_id || null,
        image_url: data.image_url || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-categories'] });
      toast.success('Categoria atualizada!');
      resetCategoryForm();
    },
    onError: () => toast.error('Erro ao atualizar categoria'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('study_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-categories'] });
      toast.success('Categoria excluída!');
    },
    onError: () => toast.error('Erro ao excluir categoria'),
  });

  // Study mutations
  const createStudyMutation = useMutation({
    mutationFn: async (data: typeof studyFormData) => {
      const { error } = await supabase.from('bible_studies').insert({
        title: data.title,
        description: data.description || null,
        content: data.content,
        category_id: data.category_id || null,
        subcategory_id: data.subcategory_id || null,
        image_url: data.image_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-studies'] });
      toast.success('Estudo criado com sucesso!');
      resetStudyForm();
      setStudyDialogOpen(false);
    },
    onError: () => toast.error('Erro ao criar estudo'),
  });

  const updateStudyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof studyFormData }) => {
      const { error } = await supabase.from('bible_studies').update({
        title: data.title,
        description: data.description || null,
        content: data.content,
        category_id: data.category_id || null,
        subcategory_id: data.subcategory_id || null,
        image_url: data.image_url || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-studies'] });
      toast.success('Estudo atualizado!');
      resetStudyForm();
      setStudyDialogOpen(false);
    },
    onError: () => toast.error('Erro ao atualizar estudo'),
  });

  const deleteStudyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bible_studies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-studies'] });
      toast.success('Estudo excluído!');
    },
    onError: () => toast.error('Erro ao excluir estudo'),
  });

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', parent_id: '', image_url: '' });
    setEditingCategory(null);
  };

  const resetStudyForm = () => {
    setStudyFormData({
      title: '',
      description: '',
      content: '',
      category_id: '',
      subcategory_id: '',
      image_url: '',
    });
    setEditingStudy(null);
  };

  const handleEditCategory = (category: StudyCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      parent_id: category.parent_id || '',
      image_url: category.image_url || '',
    });
  };

  const handleEditStudy = (study: BibleStudy) => {
    setEditingStudy(study);
    setStudyFormData({
      title: study.title,
      description: study.description || '',
      content: study.content,
      category_id: study.category_id || '',
      subcategory_id: study.subcategory_id || '',
      image_url: study.image_url || '',
    });
    setStudyDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryFormData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryFormData });
    } else {
      createCategoryMutation.mutate(categoryFormData);
    }
  };

  const handleSaveStudy = () => {
    if (!studyFormData.title.trim() || !studyFormData.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }
    if (editingStudy) {
      updateStudyMutation.mutate({ id: editingStudy.id, data: studyFormData });
    } else {
      createStudyMutation.mutate(studyFormData);
    }
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return '-';
    const cat = categories.find(c => c.id === id);
    return cat?.name || '-';
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Gerenciar Estudos Bíblicos</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
            setCategoryDialogOpen(open);
            if (!open) resetCategoryForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="w-4 h-4 mr-2" />
                Gerenciar Categorias
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerenciar Categorias</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Category Form */}
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold">
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <Label>Nome da Categoria</Label>
                      <Input
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Antigo Testamento"
                      />
                    </div>
                    <div>
                      <Label>Categoria Pai (opcional)</Label>
                      <Select
                        value={categoryFormData.parent_id || '__NONE__'}
                        onValueChange={(value) => setCategoryFormData(prev => ({ 
                          ...prev, 
                          parent_id: value === '__NONE__' ? '' : value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhuma (categoria principal)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__NONE__">Nenhuma (Categoria Principal)</SelectItem>
                          {mainCategories
                            .filter(c => c.id !== editingCategory?.id)
                            .map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>URL da Imagem (opcional)</Label>
                      <Input
                        value={categoryFormData.image_url}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveCategory}>
                        {editingCategory ? 'Atualizar' : 'Criar'} Categoria
                      </Button>
                      {editingCategory && (
                        <Button variant="outline" onClick={resetCategoryForm}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Categories List */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Categorias Principais</h3>
                  {mainCategories.map((cat) => (
                    <Card key={cat.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cat.name}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditCategory(cat)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteCategoryMutation.mutate(cat.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {getSubcategoriesForCategory(cat.id).length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-muted space-y-2">
                          {getSubcategoriesForCategory(cat.id).map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between py-1">
                              <span className="text-muted-foreground">{sub.name}</span>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditCategory(sub)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteCategoryMutation.mutate(sub.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                  {mainCategories.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma categoria criada ainda
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={studyDialogOpen} onOpenChange={(open) => {
            setStudyDialogOpen(open);
            if (!open) resetStudyForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Estudo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStudy ? 'Editar Estudo' : 'Novo Estudo Bíblico'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={studyFormData.title}
                    onChange={(e) => setStudyFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do estudo"
                  />
                </div>
                
                <div>
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={studyFormData.description}
                    onChange={(e) => setStudyFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Breve descrição do estudo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select
                      value={studyFormData.category_id || '__NONE__'}
                      onValueChange={(value) => setStudyFormData(prev => ({ 
                        ...prev, 
                        category_id: value === '__NONE__' ? '' : value,
                        subcategory_id: '' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__NONE__">Sem categoria</SelectItem>
                        {mainCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Subcategoria</Label>
                    <Select
                      value={studyFormData.subcategory_id || '__NONE__'}
                      onValueChange={(value) => setStudyFormData(prev => ({ 
                        ...prev, 
                        subcategory_id: value === '__NONE__' ? '' : value 
                      }))}
                      disabled={!studyFormData.category_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__NONE__">Sem subcategoria</SelectItem>
                        {studyFormData.category_id && 
                          getSubcategoriesForCategory(studyFormData.category_id).map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>URL da Imagem de Capa (opcional)</Label>
                  <Input
                    value={studyFormData.image_url}
                    onChange={(e) => setStudyFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label>Conteúdo do Estudo</Label>
                  <TextEditor
                    value={studyFormData.content}
                    onChange={(value) => setStudyFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Escreva o conteúdo do estudo aqui..."
                    rows={15}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setStudyDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveStudy}>
                    {editingStudy ? 'Atualizar' : 'Criar'} Estudo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Studies Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Subcategoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studies.map((study) => (
                <TableRow key={study.id}>
                  <TableCell className="font-medium">{study.title}</TableCell>
                  <TableCell>{getCategoryName(study.category_id)}</TableCell>
                  <TableCell>{getCategoryName(study.subcategory_id)}</TableCell>
                  <TableCell>
                    {new Date(study.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleEditStudy(study)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteStudyMutation.mutate(study.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {studies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum estudo criado ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
};

export default ManageBibleStudies;
