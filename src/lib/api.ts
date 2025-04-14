
import { AuthResponse, User, EPGData, Channel } from "@/types";

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = "https://api.monflix.it";

// Mock data for development
const MOCK_DATA = {
  m3uUrl: "https://example.com/playlist.m3u",
  epgData: {} as EPGData,
};

/**
 * Authenticate a user
 */
export async function loginUser(username: string, password: string): Promise<User> {
  try {
    // In a real application, this would be a POST request to your API
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ username, password }),
    // });
    
    // For development/testing, simulate API response
    const mockResponse: AuthResponse = { 
      status: username && password ? "success" : "error",
      message: username && password ? "Login successful" : "Invalid credentials",
    };
    
    if (mockResponse.status === "error") {
      throw new Error(mockResponse.message || "Errore di autenticazione");
    }
    
    // Store login state in localStorage
    localStorage.setItem("monflix_user", JSON.stringify({ 
      username, 
      isLoggedIn: true 
    }));
    
    return { username, isLoggedIn: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Log out the current user
 */
export function logoutUser(): void {
  localStorage.removeItem("monflix_user");
}

/**
 * Get the currently logged in user
 */
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem("monflix_user");
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
}

/**
 * Fetch the M3U playlist URL from the API
 */
export async function fetchM3UUrl(): Promise<string> {
  try {
    // In a real application, this would be an API call
    // const response = await fetch(`${API_BASE_URL}/playlist/url`);
    // const data = await response.json();
    // return data.url;
    
    // For development/testing, return mock URL
    return MOCK_DATA.m3uUrl;
  } catch (error) {
    console.error("Failed to fetch M3U URL:", error);
    throw error;
  }
}

/**
 * Fetch EPG data for channels
 */
export async function fetchEPGData(): Promise<EPGData> {
  try {
    // In a real application, this would be an API call
    // const response = await fetch(`${API_BASE_URL}/epg`);
    // return await response.json();
    
    // For development/testing, generate mock EPG data
    return generateMockEPGData();
  } catch (error) {
    console.error("Failed to fetch EPG data:", error);
    throw error;
  }
}

/**
 * Generate mock EPG data for testing
 */
function generateMockEPGData(): EPGData {
  const mockEPG: EPGData = {};
  const channels = ["channel_1", "channel_2", "channel_3"];
  const now = new Date();
  
  channels.forEach(channelId => {
    mockEPG[channelId] = [];
    
    // Generate programs for the next 24 hours
    for (let i = 0; i < 24; i++) {
      const startTime = new Date(now);
      startTime.setHours(now.getHours() + i);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      
      mockEPG[channelId].push({
        id: `${channelId}_program_${i}`,
        channelId,
        title: `Programma ${i + 1}`,
        description: `Descrizione del programma ${i + 1}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: 60, // minutes
      });
    }
  });
  
  return mockEPG;
}

/**
 * Generate mock channels for testing
 */
export function generateMockChannels(): Channel[] {
  return [
    {
      id: "channel_1",
      title: "Rai 1",
      logo: "https://via.placeholder.com/150",
      staffId: "RAI",
      groupTitle: "Nazionali",
      url: "https://example.com/stream1.mpd",
      streamProps: {
        manifestType: "mpd",
        licenseType: "org.w3.clearkey",
        licenseKey: "key1",
        streamHeaders: { "user-agent": "ExampleAgent" }
      }
    },
    {
      id: "channel_2",
      title: "Canale 5",
      logo: "https://via.placeholder.com/150",
      staffId: "MEDIASET",
      groupTitle: "Nazionali",
      url: "https://example.com/stream2.mpd",
      streamProps: {
        manifestType: "mpd",
        licenseType: "org.w3.clearkey",
        licenseKey: "key2",
        streamHeaders: { "user-agent": "ExampleAgent" }
      }
    },
    {
      id: "channel_3",
      title: "Sky Sport",
      logo: "https://via.placeholder.com/150",
      staffId: "SKY",
      groupTitle: "Sport",
      url: "https://example.com/stream3.mpd",
      streamProps: {
        manifestType: "mpd",
        licenseType: "org.w3.clearkey",
        licenseKey: "key3",
        streamHeaders: { "user-agent": "ExampleAgent" }
      }
    },
    {
      id: "channel_4",
      title: "DAZN 1",
      logo: "https://via.placeholder.com/150",
      staffId: "DAZN",
      groupTitle: "Sport",
      url: "https://example.com/stream4.mpd",
      streamProps: {
        manifestType: "mpd",
        licenseType: "org.w3.clearkey",
        licenseKey: "key4",
        streamHeaders: { "user-agent": "ExampleAgent" }
      }
    },
    {
      id: "channel_5",
      title: "Sky Cinema",
      logo: "https://via.placeholder.com/150",
      staffId: "SKY",
      groupTitle: "Film",
      url: "https://example.com/stream5.mpd",
      streamProps: {
        manifestType: "mpd",
        licenseType: "org.w3.clearkey",
        licenseKey: "key5",
        streamHeaders: { "user-agent": "ExampleAgent" }
      }
    }
  ];
}
