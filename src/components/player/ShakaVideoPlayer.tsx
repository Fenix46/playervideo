
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
  const playerRef = useRef<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playerInitialized, setPlayerInitialized] = useState(false);
  const [internalError, setInternalError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for browser support
    const isBrowserSupported = shaka.Player.isBrowserSupported();
    if (!isBrowserSupported) {
      const error = new Error("Browser not supported");
      setInternalError(error);
      toast.error("Il tuo browser non supporta lo streaming richiesto");
      if (onError) onError(error);
      return;
    }

    // Initialize Shaka Player
    const initPlayer = async () => {
      try {
        // Destroy existing player instance if any
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        
        // Create a Shaka Player instance
        const player = new shaka.Player(videoRef.current!);
        
        // Store player reference
        playerRef.current = player;
        
        // Listen for errors
        player.addEventListener('error', (event) => {
          console.error('Error code', event.detail.code, 'object', event.detail);
          const error = new Error(event.detail.message || "Player error");
          setInternalError(error);
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

        // Mark player as initialized
        setPlayerInitialized(true);
        setInternalError(null);

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
            // This is not a fatal error, just autoplay prevention
          }
        }
      } catch (error) {
        console.error('Player initialization error:', error);
        setInternalError(error instanceof Error ? error : new Error('Unknown player error'));
        toast.error('Impossibile inizializzare il player');
        if (onError) onError(error);
      }
    };

    // Only initialize if we have a valid video element
    if (videoRef.current) {
      initPlayer();
    }

    // Clean up on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [channel.url, channel.streamProps]);

  // Play/pause toggle
  const togglePlay = async () => {
    if (!videoRef.current || internalError) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Play error:', error);
        toast.error('Impossibile avviare la riproduzione');
      }
    }
  };

  // Mute/unmute toggle
  const toggleMute = () => {
    if (!videoRef.current || internalError) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  // If there's an internal error, render an error state
  if (internalError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black text-white">
        <div className="text-center p-4">
          <p className="text-lg mb-2">Errore di riproduzione</p>
          <p className="text-sm text-gray-400 mb-4">{internalError.message}</p>
          <Button 
            variant="outline"
            onClick={() => {
              setInternalError(null);
              // Try to reinitialize player
              if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
              }
              // The useEffect will run again on next render
              setPlayerInitialized(false);
            }}
          >
            Riprova
          </Button>
        </div>
      </div>
    );
  }

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
            disabled={!playerInitialized}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            className="hover:bg-white/10"
            disabled={!playerInitialized}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShakaVideoPlayer;
