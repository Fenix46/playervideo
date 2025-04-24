
import React, { useEffect, useRef, useState } from "react";
import shaka from "shaka-player";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Channel } from "@/types";
import { toast } from "sonner";

interface ShakaVideoPlayerProps {
  channel: Channel;
  onError?: (error: any) => void;
}

const ShakaVideoPlayer: React.FC<ShakaVideoPlayerProps> = ({ channel, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<shaka.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Check for browser support
    const isBrowserSupported = shaka.Player.isBrowserSupported();
    if (!isBrowserSupported) {
      toast.error("Il tuo browser non supporta lo streaming richiesto");
      if (onError) onError(new Error("Browser not supported"));
      return;
    }

    // Initialize Shaka Player
    const initPlayer = async () => {
      try {
        // Create a Shaka Player instance
        const player = new shaka.Player(videoRef.current!);
        
        // Store player reference
        playerRef.current = player;
        
        // Listen for errors
        player.addEventListener('error', (event) => {
          console.error('Error code', event.detail.code, 'object', event.detail);
          toast.error(`Errore di riproduzione: ${event.detail.message}`);
          if (onError) onError(event.detail);
        });
        
        // Configure player
        player.configure({
          streaming: {
            // Set buffer configuration (in seconds)
            bufferingGoal: 30,
            rebufferingGoal: 2,
            bufferBehind: 30
          }
        });
        
        // Add custom headers if provided in channel
        if (channel.streamProps.streamHeaders) {
          player.getNetworkingEngine()?.registerRequestFilter((type, request) => {
            if (channel.streamProps.streamHeaders) {
              // Add custom headers to all requests
              Object.entries(channel.streamProps.streamHeaders).forEach(([key, value]) => {
                request.headers[key] = value;
              });
            }
          });
        }

        // Configure DRM if needed
        if (channel.streamProps.licenseType === 'org.w3.clearkey' && channel.streamProps.licenseKey) {
          player.configure({
            drm: {
              clearKeys: {
                // Parse keys from license key format
                [channel.streamProps.licenseKey.split(':')[0]]: channel.streamProps.licenseKey.split(':')[1] || ''
              }
            }
          });
        }

        // Load the stream
        await player.load(channel.url);
        console.log('Stream loaded successfully');
        
        // Auto-play the video
        if (videoRef.current) {
          try {
            await videoRef.current.play();
            setIsPlaying(true);
          } catch (error) {
            console.warn('Autoplay prevented by browser', error);
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error('Player initialization error:', error);
        toast.error('Impossibile inizializzare il player');
        if (onError) onError(error);
      }
    };

    initPlayer();

    // Clean up on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [channel.url, onError, channel.streamProps]);

  // Play/pause toggle
  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error('Play error:', error);
        toast.error('Impossibile avviare la riproduzione');
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  // Mute/unmute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full bg-black"
        controls={false}
        playsInline
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
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
      </div>
    </div>
  );
};

export default ShakaVideoPlayer;
