
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlaybackSource } from "@/types/vod";
import ShakaVideoPlayer from "@/components/player/ShakaVideoPlayer";
import { getScToken, getTvToken } from "@/lib/scApi";
import { Channel } from "@/types";

const VODPlayer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [playbackSource, setPlaybackSource] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchPlaybackSource = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { type, movieId, episodeId, seriesId, title } = location.state as PlaybackSource;
        
        let videoUrl: string | null = null;
        
        if (type === 'sc_movie' && movieId) {
          videoUrl = await getScToken(movieId);
        } else if (type === 'episode' && episodeId && seriesId) {
          videoUrl = await getTvToken(episodeId, seriesId);
        }
        
        if (!videoUrl) {
          throw new Error("Impossibile ottenere l'URL del video");
        }
        
        // Create a Channel object that ShakaVideoPlayer can use
        const channel: Channel = {
          id: movieId || episodeId || "vod",
          title: title || "Video",
          url: videoUrl,
          streamProps: {
            manifestType: videoUrl.endsWith('mpd') ? 'mpd' : 'm3u8',
            streamHeaders: {
              'Referer': 'https://vixcloud.co/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
          }
        };
        
        setPlaybackSource(channel);
      } catch (error) {
        console.error("Error fetching playback source:", error);
        setError(error instanceof Error ? error : new Error("Si è verificato un errore"));
        toast.error("Impossibile caricare il video");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaybackSource();
  }, [location.state]);
  
  const handleError = (error: any) => {
    console.error("Player error:", error);
    toast.error("Errore di riproduzione");
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg">Caricamento del video...</p>
        </div>
      </div>
    );
  }
  
  if (error || !playbackSource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Errore di riproduzione</h1>
          <p className="mb-6 text-muted-foreground">
            {error?.message || "Impossibile caricare il video"}
          </p>
          <Button onClick={handleBack}>Torna indietro</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Video player area */}
      <div className="relative w-full aspect-video bg-black">
        {/* Back button overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </Button>
        </div>
        
        {/* Shaka Video Player */}
        <ShakaVideoPlayer 
          channel={playbackSource}
          onError={handleError}
        />
      </div>
      
      {/* Title and info */}
      <div className="monflix-container py-6">
        <h1 className="text-2xl font-bold mb-4">{playbackSource.title}</h1>
      </div>
    </div>
  );
};

export default VODPlayer;
