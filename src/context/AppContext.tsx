
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { parseM3U } from "@/lib/m3uParser";
import { fetchM3UUrl, fetchEPGData } from "@/lib/api";
import { AppState, Channel, User } from "@/types";

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
          // Fetch the M3U playlist URL from API
          const m3uUrl = await fetchM3UUrl();
          
          // Fetch and parse the M3U content
          const response = await fetch(m3uUrl);
          const m3uContent = await response.text();
          const channels = parseM3U(m3uContent);
          
          dispatch({ type: "LOAD_CHANNELS", payload: channels });
          
          // Update EPG data
          const epgData = await fetchEPGData();
          dispatch({ type: "UPDATE_EPG_DATA", payload: epgData });
        }
      } catch (error) {
        console.error("Failed to refresh data:", error);
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
