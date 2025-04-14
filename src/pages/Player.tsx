
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { ArrowLeft, Pause, Play, Settings, Volume2, VolumeX } from "lucide-react";
import { EPGItem } from "@/types";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentEpg, setCurrentEpg] = useState<EPGItem | null>(null);

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

  // Mock player controls
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
        
        {/* Mock video player - in a real app, this would be replaced with an actual video player */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{channel.title}</h2>
            <p className="text-muted-foreground">{channel.groupTitle}</p>
            {currentEpg && (
              <div className="mt-4">
                <p className="font-medium">{currentEpg.title}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentEpg.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(currentEpg.endTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Player controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={togglePlay}
                className="hover:bg-white/10"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMute}
                className="hover:bg-white/10"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
            </div>
            
            <div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-white/10"
              >
                <Settings size={20} />
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 w-full bg-white/20 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full" 
              style={{ width: currentEpg ? `${calculateProgress(currentEpg)}%` : "0%" }}
            />
          </div>
        </div>
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
