
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { parseM3U } from "@/lib/m3uParser";
import { fetchM3UPlaylist, fetchEPGData, generateMockChannels } from "@/lib/api";
import { AppState, Channel, User } from "@/types";
import { toast } from "sonner";

type AppAction = 
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOAD_CHANNELS"; payload: Channel[] }
  | { type: "SET_ACTIVE_CHANNEL"; payload: Channel }
  | { type: "UPDATE_EPG_DATA"; payload: any }
  | { type: "REFRESH_DATA" };

const initialState: AppState = {
  user: null,
  channelGroups: [],
  epgData: {},
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "LOAD_CHANNELS": {
      // Group channels by their groupTitle
      const groups = action.payload.reduce((acc, channel) => {
        const groupTitle = channel.groupTitle || "Altro";
        
        if (!acc[groupTitle]) {
          acc[groupTitle] = [];
        }
        
        acc[groupTitle].push(channel);
        return acc;
      }, {} as Record<string, Channel[]>);
      
      // Convert to array format for easier rendering
      const channelGroups = Object.entries(groups).map(([title, channels]) => ({
        title,
        channels,
      }));
      
      return {
        ...state,
        channelGroups,
        lastUpdated: new Date().toISOString(),
      };
    }
    case "SET_ACTIVE_CHANNEL":
      return {
        ...state,
        activeChannel: action.payload,
      };
    case "UPDATE_EPG_DATA":
      return {
        ...state,
        epgData: action.payload,
      };
    case "REFRESH_DATA":
      // Will be handled in the effect
      return state;
    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Effect for periodic refresh (every 60 seconds)
  useEffect(() => {
    const loadData = async () => {
      try {
        if (state.user?.isLoggedIn) {
          console.log("Loading data for logged in user:", state.user.username);
          
          try {
            // Fetch and parse the M3U content directly
            const m3uContent = await fetchM3UPlaylist();
            
            if (m3uContent && m3uContent.trim().length > 0) {
              console.log("M3U content fetched successfully, parsing...");
              const channels = parseM3U(m3uContent);
              console.log(`Parsed ${channels.length} channels from M3U content`);
              
              if (channels.length > 0) {
                dispatch({ type: "LOAD_CHANNELS", payload: channels });
                toast.success(`Caricati ${channels.length} canali`);
              } else {
                console.warn("No channels parsed from M3U content, falling back to mock channels");
                const mockChannels = generateMockChannels();
                dispatch({ type: "LOAD_CHANNELS", payload: mockChannels });
                toast.info("Utilizzando canali di esempio");
              }
            } else {
              console.warn("Empty M3U content received, falling back to mock channels");
              // Fallback to mock channels if M3U content is empty
              const mockChannels = generateMockChannels();
              dispatch({ type: "LOAD_CHANNELS", payload: mockChannels });
              toast.info("Utilizzando canali di esempio");
            }
          } catch (error) {
            console.error("Error processing M3U content:", error);
            // Fallback to mock channels on error
            const mockChannels = generateMockChannels();
            dispatch({ type: "LOAD_CHANNELS", payload: mockChannels });
            toast.error("Errore nel caricamento dei canali, utilizzando canali di esempio");
          }
          
          // Update EPG data
          const epgData = await fetchEPGData();
          dispatch({ type: "UPDATE_EPG_DATA", payload: epgData });
        }
      } catch (error) {
        console.error("Failed to refresh data:", error);
        toast.error("Errore durante l'aggiornamento dei dati");
      }
    };

    // Initial load
    if (state.user?.isLoggedIn && state.channelGroups.length === 0) {
      loadData();
    }

    // Setup refresh timer
    const refreshTimer = setInterval(loadData, 60000); // 60 seconds

    return () => clearInterval(refreshTimer);
  }, [state.user?.isLoggedIn, state.channelGroups.length]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
