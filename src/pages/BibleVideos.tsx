import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BibleVideos = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['bible-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_videos')
        .select('*')
        .order('book_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const oldTestamentVideos = videos?.filter(v => v.testament === 'Antigo') || [];
  const newTestamentVideos = videos?.filter(v => v.testament === 'Novo') || [];

  const VideoCard = ({ video }: { video: any }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedVideo(video)}>
      <CardHeader>
        <div className="relative aspect-video bg-muted rounded-md mb-2 overflow-hidden">
          {video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt={video.book_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Play className="h-12 w-12 text-primary" />
            </div>
          )}
        </div>
        <CardTitle className="text-xl">{video.book_name}</CardTitle>
        <CardDescription>{video.duration_minutes} minutos</CardDescription>
      </CardHeader>
      {video.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Resumos Bíblicos</h1>
            <p className="text-muted-foreground">Vídeos de 5 minutos sobre cada livro da Bíblia</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Carregando vídeos...</div>
        ) : videos && videos.length > 0 ? (
          <Tabs defaultValue="antigo" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="antigo">Antigo Testamento ({oldTestamentVideos.length})</TabsTrigger>
              <TabsTrigger value="novo">Novo Testamento ({newTestamentVideos.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="antigo" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {oldTestamentVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="novo" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newTestamentVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
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
                  <DialogTitle>{selectedVideo?.book_name}</DialogTitle>
                  <DialogDescription>
                    Resumo bíblico de {selectedVideo?.duration_minutes} minutos
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="aspect-video w-full">
              <iframe
                src={`${selectedVideo?.video_url}?modestbranding=1&rel=0&showinfo=0`}
                className="w-full h-full rounded-md"
                allowFullScreen
                title={selectedVideo?.book_name}
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
