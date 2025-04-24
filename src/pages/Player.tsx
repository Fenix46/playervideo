
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { ArrowLeft, Settings } from "lucide-react";
import { EPGItem } from "@/types";
import ShakaVideoPlayer from "@/components/player/ShakaVideoPlayer";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [currentEpg, setCurrentEpg] = useState<EPGItem | null>(null);
  const [playerError, setPlayerError] = useState<any>(null);

  const channel = state.channelGroups
    .flatMap(group => group.channels)
    .find(c => c.id === channelId);

  // Get current EPG info
  useEffect(() => {
    if (channelId && state.epgData[channelId]) {
      const now = new Date();
      const program = state.epgData[channelId].find(p => {
        const start = new Date(p.startTime);
        const end = new Date(p.endTime);
        return now >= start && now < end;
      });
      
      if (program) {
        setCurrentEpg(program);
      }
    }
  }, [channelId, state.epgData]);

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle player errors
  const handlePlayerError = (error: any) => {
    console.error("Player error:", error);
    setPlayerError(error);
  };
  
  if (!channel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Canale non trovato</h1>
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
        
        {/* Settings button */}
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
          >
            <Settings size={20} />
          </Button>
        </div>
        
        {/* Shaka Video Player */}
        {!playerError ? (
          <ShakaVideoPlayer 
            channel={channel}
            onError={handlePlayerError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center p-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Errore di riproduzione</h2>
              <p className="text-muted-foreground mb-4">
                Impossibile riprodurre questo canale. Prova a selezionare un altro canale.
              </p>
              <Button onClick={handleBack}>Torna ai canali</Button>
            </div>
          </div>
        )}
        
        {/* Progress bar for EPG */}
        {currentEpg && (
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-2">
            <div className="mt-2 w-full bg-white/20 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full" 
                style={{ width: `${calculateProgress(currentEpg)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* EPG information */}
      <div className="monflix-container py-6">
        <h1 className="text-2xl font-bold mb-4">{channel.title}</h1>
        
        {currentEpg && (
          <div className="mb-4">
            <h2 className="text-xl font-medium">{currentEpg.title}</h2>
            <div className="flex items-center text-muted-foreground mt-1">
              <span>
                {new Date(currentEpg.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(currentEpg.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="mx-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
              <span>{channel.groupTitle}</span>
            </div>
            
            {currentEpg.description && (
              <p className="mt-4 text-muted-foreground">{currentEpg.description}</p>
            )}
          </div>
        )}
        
        {/* Upcoming programs */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Programmazione</h3>
          
          <div className="space-y-2">
            {state.epgData[channelId!]?.map((program) => {
              const isPast = new Date(program.endTime) < new Date();
              const isCurrent = currentEpg?.id === program.id;
              
              return (
                <div 
                  key={program.id} 
                  className={`
                    p-3 rounded-md border
                    ${isCurrent ? 'bg-primary/10 border-primary' : 'border-border'}
                    ${isPast ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{program.title}</h4>
                      {program.description && (
                        <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(program.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate progress percentage for current program
function calculateProgress(program: EPGItem): number {
  const now = new Date().getTime();
  const start = new Date(program.startTime).getTime();
  const end = new Date(program.endTime).getTime();
  
  // Calculate the elapsed time as a percentage of the total duration
  const elapsed = now - start;
  const total = end - start;
  
  return Math.min(Math.max(Math.floor((elapsed / total) * 100), 0), 100);
}

export default Player;
