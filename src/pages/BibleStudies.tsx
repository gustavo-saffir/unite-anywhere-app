import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ArrowLeft, BookOpen, ChevronRight, X } from 'lucide-react';

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
}

const BibleStudies = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<BibleStudy | null>(null);

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
        .order('title');
      if (error) throw error;
      return data as BibleStudy[];
    },
  });

  const mainCategories = categories.filter(c => !c.parent_id);
  
  const getSubcategoriesForCategory = (categoryId: string) => {
    return categories.filter(c => c.parent_id === categoryId);
  };

  const getStudiesForView = () => {
    if (selectedSubcategory) {
      return studies.filter(s => s.subcategory_id === selectedSubcategory);
    }
    if (selectedCategory) {
      const subcats = getSubcategoriesForCategory(selectedCategory);
      if (subcats.length === 0) {
        // No subcategories, show studies directly in this category
        return studies.filter(s => s.category_id === selectedCategory && !s.subcategory_id);
      }
    }
    return [];
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return '';
    const cat = categories.find(c => c.id === id);
    return cat?.name || '';
  };

  const handleBack = () => {
    if (selectedStudy) {
      setSelectedStudy(null);
    } else if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigate('/dashboard');
    }
  };

  // Render study content
  if (selectedStudy) {
    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-foreground truncate">
                  {selectedStudy.title}
                </h1>
                {selectedStudy.category_id && (
                  <p className="text-sm text-muted-foreground">
                    {getCategoryName(selectedStudy.category_id)}
                    {selectedStudy.subcategory_id && ` > ${getCategoryName(selectedStudy.subcategory_id)}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {selectedStudy.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img 
                src={selectedStudy.image_url} 
                alt={selectedStudy.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          
          {selectedStudy.description && (
            <p className="text-muted-foreground mb-6 italic">
              {selectedStudy.description}
            </p>
          )}

          <Card className="p-6">
            <ScrollArea className="max-h-[70vh]">
              <MarkdownRenderer content={selectedStudy.content} />
            </ScrollArea>
          </Card>
        </main>
      </div>
    );
  }

  // Render subcategories or studies list
  if (selectedCategory) {
    const subcats = getSubcategoriesForCategory(selectedCategory);
    const directStudies = getStudiesForView();

    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {getCategoryName(selectedCategory)}
                </h1>
                {selectedSubcategory && (
                  <p className="text-sm text-muted-foreground">
                    {getCategoryName(selectedSubcategory)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {/* Show subcategories if available and no subcategory selected */}
          {!selectedSubcategory && subcats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcats.map((subcat) => {
                const studyCount = studies.filter(s => s.subcategory_id === subcat.id).length;
                return (
                  <Card 
                    key={subcat.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                    onClick={() => setSelectedSubcategory(subcat.id)}
                  >
                    {subcat.image_url ? (
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={subcat.image_url} 
                          alt={subcat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg font-semibold text-white">{subcat.name}</h3>
                          <p className="text-white/70 text-sm">{studyCount} estudo(s)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{subcat.name}</h3>
                          <p className="text-muted-foreground text-sm">{studyCount} estudo(s)</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Show studies */}
          {(selectedSubcategory || subcats.length === 0) && (
            <div className="space-y-4">
              {directStudies.map((study) => (
                <Card 
                  key={study.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedStudy(study)}
                >
                  <div className="flex gap-4">
                    {study.image_url && (
                      <img 
                        src={study.image_url} 
                        alt={study.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{study.title}</h3>
                      {study.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {study.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 self-center" />
                  </div>
                </Card>
              ))}
              
              {directStudies.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum estudo disponível nesta categoria</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Render main categories
  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-celestial flex items-center justify-center shadow-glow">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Estudos Bíblicos</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {mainCategories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma categoria de estudo disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainCategories.map((category) => {
              const subcats = getSubcategoriesForCategory(category.id);
              const studyCount = studies.filter(s => 
                s.category_id === category.id || 
                subcats.some(sub => sub.id === s.subcategory_id)
              ).length;
              
              return (
                <Card 
                  key={category.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.image_url ? (
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <p className="text-white/70 text-sm">
                          {subcats.length > 0 
                            ? `${subcats.length} subcategoria(s)` 
                            : `${studyCount} estudo(s)`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {subcats.length > 0 
                            ? `${subcats.length} subcategoria(s)` 
                            : `${studyCount} estudo(s)`}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default BibleStudies;
