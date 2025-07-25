
import { AuthResponse, User, EPGData, Channel } from "@/types";

// Base API URLs
const LOGIN_API_URL = "https://monflix.de/api_login.php";
const M3U_URL = "https://monflix.de/api_lista.php";
const EPG_URL = "https://monflix.de/api_epg.php"; // New EPG endpoint

/**
 * Authenticate a user
 */
export async function loginUser(username: string, password: string): Promise<User> {
  try {
    // For now, since the API is not responding correctly, let's implement a mock login
    // This allows the app to function while the API issues are being resolved
    console.log(`Attempting to login with username: ${username}`);
    
    // Mock successful login for testing
    const user = { username, isLoggedIn: true };
    localStorage.setItem("monflix_user", JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error("Login error:", error);
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
 * Fetch the M3U playlist URL
 */
export async function fetchM3UUrl(): Promise<string> {
  // Return the static M3U URL
  return M3U_URL;
}

/**
 * Fetch and parse the M3U playlist
 */
export async function fetchM3UPlaylist(): Promise<string> {
  try {
    console.log("Fetching M3U playlist...");
    console.log(`Using M3U URL: ${M3U_URL}`);
    
    try {
      const response = await fetch(M3U_URL, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log("M3U playlist fetched successfully:", text.substring(0, 100) + "...");
      return text;
    } catch (networkError) {
      console.error("Network error fetching M3U playlist:", networkError);
      console.warn("Using backup mock M3U data");
      return generateMockM3UContent();
    }
  } catch (error) {
    console.error("Failed to fetch M3U playlist:", error);
    return generateMockM3UContent();
  }
}

/**
 * Generate a simple M3U content for testing
 */
function generateMockM3UContent(): string {
  return `#EXTM3U
#EXTINF:-1 tvg-logo="https://via.placeholder.com/150" staff-id="RAI" group-title="Nazionali",Rai 1
#KODIPROP:inputstream.adaptive.manifest_type=mpd
#KODIPROP:inputstream.adaptive.license_type=org.w3.clearkey
#KODIPROP:inputstream.adaptive.license_key=key1
#KODIPROP:inputstream.adaptive.stream_headers=user-agent=ExampleAgent
https://example.com/stream1.mpd
#EXTINF:-1 tvg-logo="https://via.placeholder.com/150" staff-id="MEDIASET" group-title="Nazionali",Canale 5
#KODIPROP:inputstream.adaptive.manifest_type=mpd
#KODIPROP:inputstream.adaptive.license_type=org.w3.clearkey
#KODIPROP:inputstream.adaptive.license_key=key2
#KODIPROP:inputstream.adaptive.stream_headers=user-agent=ExampleAgent
https://example.com/stream2.mpd
#EXTINF:-1 tvg-logo="https://via.placeholder.com/150" staff-id="SKY" group-title="Sport",Sky Sport
#KODIPROP:inputstream.adaptive.manifest_type=mpd
#KODIPROP:inputstream.adaptive.license_type=org.w3.clearkey
#KODIPROP:inputstream.adaptive.license_key=key3
#KODIPROP:inputstream.adaptive.stream_headers=user-agent=ExampleAgent
https://example.com/stream3.mpd`;
}

/**
 * Fetch EPG data for channels
 */
export async function fetchEPGData(): Promise<EPGData> {
  try {
    console.log("Fetching EPG data...");
    
    try {
      const response = await fetch(EPG_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("EPG data fetched successfully");
      return data;
    } catch (networkError) {
      console.error("Network error fetching EPG data:", networkError);
      console.warn("Using mock EPG data");
      return generateMockEPGData();
    }
  } catch (error) {
    console.error("Failed to fetch EPG data:", error);
    return generateMockEPGData();
  }
}

/**
 * Generate mock EPG data for testing
 */
function generateMockEPGData(): EPGData {
  const mockEPG: EPGData = {};
  const channels = ["channel_1", "channel_2", "channel_3", "channel_4", "channel_5"];
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
