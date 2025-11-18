import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BibleVideos = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['bible-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Group videos by category and subcategory
  const groupedVideos = videos?.reduce((acc: any, video) => {
    if (!acc[video.category]) {
      acc[video.category] = {};
    }
    if (!acc[video.category][video.subcategory]) {
      acc[video.category][video.subcategory] = [];
    }
    acc[video.category][video.subcategory].push(video);
    return acc;
  }, {});

  const CategoryCard = ({ category, subcategories }: { category: string; subcategories: any }) => {
    const firstVideo = Object.values(subcategories)[0][0];
    const imageUrl = firstVideo?.category_image_url || firstVideo?.thumbnail_url;

    return (
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => setSelectedCategory(category)}
      >
        <CardHeader>
          <div className="relative aspect-video bg-muted rounded-md mb-2 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={category} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Play className="h-12 w-12 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl">{category}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {Object.keys(subcategories).length} subcategorias disponíveis
          </p>
        </CardContent>
      </Card>
    );
  };

  const SubcategoryCard = ({ subcategory, videos }: { subcategory: string; videos: any[] }) => {
    const firstVideo = videos[0];
    const imageUrl = firstVideo?.subcategory_image_url || firstVideo?.thumbnail_url;

    return (
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => setSelectedSubcategory(subcategory)}
      >
        <CardHeader>
          <div className="relative aspect-video bg-muted rounded-md mb-2 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={subcategory} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Play className="h-12 w-12 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-lg">{subcategory}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {videos.length} vídeo{videos.length !== 1 ? 's' : ''} disponível{videos.length !== 1 ? 'is' : ''}
          </p>
        </CardContent>
      </Card>
    );
  };

  const VideoCard = ({ video }: { video: any }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedVideo(video)}>
      <CardHeader>
        <div className="relative aspect-video bg-muted rounded-md mb-2 overflow-hidden">
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Play className="h-12 w-12 text-primary" />
            </div>
          )}
        </div>
        <CardTitle className="text-xl">{video.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{video.duration_minutes} minutos</p>
      </CardHeader>
      {video.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
        </CardContent>
      )}
    </Card>
  );

  const renderContent = () => {
    if (!selectedCategory) {
      // Show categories
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedVideos && Object.entries(groupedVideos).map(([category, subcategories]) => (
            <CategoryCard key={category} category={category} subcategories={subcategories} />
          ))}
        </div>
      );
    }

    if (!selectedSubcategory) {
      // Show subcategories for selected category
      return (
        <>
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para categorias
          </Button>
          <h2 className="text-2xl font-bold mb-6">{selectedCategory}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedVideos && groupedVideos[selectedCategory] && 
              Object.entries(groupedVideos[selectedCategory]).map(([subcategory, videos]: [string, any]) => (
                <SubcategoryCard key={subcategory} subcategory={subcategory} videos={videos} />
              ))
            }
          </div>
        </>
      );
    }

    // Show videos for selected subcategory
    const videosToShow = groupedVideos?.[selectedCategory]?.[selectedSubcategory] || [];
    return (
      <>
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setSelectedSubcategory(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para subcategorias
        </Button>
        <h2 className="text-2xl font-bold mb-2">{selectedCategory}</h2>
        <h3 className="text-xl text-muted-foreground mb-6">{selectedSubcategory}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videosToShow.map((video: any) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Resumos Bíblicos</h1>
            <p className="text-muted-foreground">Venha aprender conosco de forma bem divertida!</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Carregando vídeos...</div>
        ) : videos && videos.length > 0 ? (
          renderContent()
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">Nenhum vídeo disponível no momento.</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setSelectedVideo(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <DialogTitle>{selectedVideo?.title}</DialogTitle>
                  <DialogDescription>
                    {selectedVideo?.category} • {selectedVideo?.subcategory} • {selectedVideo?.duration_minutes} minutos
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="aspect-video w-full">
              <iframe
                src={`${selectedVideo?.video_url}?controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                className="w-full h-full rounded-md"
                allowFullScreen
                title={selectedVideo?.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            {selectedVideo?.description && (
              <p className="text-sm text-muted-foreground mt-4">{selectedVideo.description}</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BibleVideos;