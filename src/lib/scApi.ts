import { toast } from "sonner";
import { CATEGORY_MAPPING } from "@/types/vod";

// Domain and inertia version will be fetched from external sources
let SC_DOMAIN = "streamingcommunity.family"; // Default fallback
let SC_INERTIA_VERSION = "6d3a7590e4575a0b17b82febe4ad8919"; // Default fallback
let SC_BASIC_URL = `https://${SC_DOMAIN}/`;

// Headers for StreamingCommunity requests
const SC_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "X-Xsrf-Token": "eyJpdiI6IkVDK2VZUFVFUVhjTjFxeFhxQnVBZ0E9PSIsInZhbHVlIjoiZzQzWlhBQzdWM1Z6ZnJyOFl4MzdLMHJod0hKWEFFR3BPUUVhN0VXdkwzSWs1L0dNbkhRR1ZzUE5nSmJaRUdaeG45TjhlbTIvZWdsTEVSQ0FJYXRlejBZdHR4Y2ZoL0FmWldsNE1DL1NzSjlwaHMySWxuRTVKVHNGeWo5U1pEa3QiLCJtYWMiOiI5NjY1ZGUwZjhmYzJhYmFhMzA0YjA1Njg3NjAyNjcxZTNhZjAxMDk4YWEzNTY4ZWU2ZTMyOTYxMWU0ZGRkOWYzIiwidGFnIjoiIn0="
};

/**
 * Fetch the domain and inertia version from external sources
 */
export const initStreamingCommunity = async (): Promise<void> => {
  try {
    console.log("Initializing StreamingCommunity...");
    
    // Fetch domain with proper error handling
    try {
      const domainResponse = await fetch("https://repository.monflix.de/domain.txt");
      if (domainResponse.ok) {
        const domainText = await domainResponse.text();
        if (domainText && domainText.trim()) {
          SC_DOMAIN = domainText.trim();
          console.log(`Retrieved domain: ${SC_DOMAIN}`);
        } else {
          console.error("Domain file is empty or contains whitespace only");
        }
      } else {
        console.error(`Failed to get domain. Status: ${domainResponse.status}`);
      }
    } catch (domainError) {
      console.error("Error fetching domain:", domainError);
    }

    // Fetch inertia version with proper error handling
    try {
      const inertiaResponse = await fetch("https://repository.monflix.de/inertia.txt");
      if (inertiaResponse.ok) {
        const inertiaText = await inertiaResponse.text();
        if (inertiaText && inertiaText.trim()) {
          SC_INERTIA_VERSION = inertiaText.trim();
          console.log(`Retrieved inertia version: ${SC_INERTIA_VERSION}`);
        } else {
          console.error("Inertia file is empty or contains whitespace only");
        }
      } else {
        console.error(`Failed to get inertia version. Status: ${inertiaResponse.status}`);
      }
    } catch (inertiaError) {
      console.error("Error fetching inertia version:", inertiaError);
    }

    // Update base URL
    SC_BASIC_URL = `https://${SC_DOMAIN}/`;
    console.log(`Using SC_BASIC_URL: ${SC_BASIC_URL}`);
    
  } catch (error) {
    console.error("Error initializing StreamingCommunity:", error);
    toast.error("Errore durante l'inizializzazione di StreamingCommunity");
  }
};

/**
 * Get file from API
 */
export const getFileFromApi = async (filePath: string): Promise<any> => {
  const url = `https://monflix.de/api_json.php?path=${encodeURIComponent(filePath)}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    const fileExtension = filePath.toLowerCase().split('.').pop() || '';
    
    if (['m3u', 'm3u8'].includes(fileExtension)) {
      return await response.text();
    }
    
    if (contentType.includes('application/json') || fileExtension === 'json') {
      try {
        return await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        return await response.text();
      }
    } else if (contentType.includes('text/plain') || contentType.includes('application/octet-stream')) {
      return await response.text();
    } else {
      console.error(`Unknown content type: ${contentType}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    return null;
  }
};

/**
 * Get TMDB information for a title
 */
export const getTmdbInfo = async (title: string, contentType: string): Promise<any> => {
  const tmdbApiKey = "ded5b7afc33c6be7e0eaefce452217b1";
  const encodedTitle = encodeURIComponent(title);
  const url = `https://api.themoviedb.org/3/search/${contentType}?api_key=${tmdbApiKey}&language=it-IT&query=${encodedTitle}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching TMDB info:", error);
    return null;
  }
};

/**
 * Parse StreamingCommunity content to extract video URL
 */
export const parseScContent = async (embedContent: string): Promise<string | null> => {
  try {
    const winVideoMatch = embedContent.match(/window\.video = {.*}/);
    if (!winVideoMatch) {
      console.error("No window.video found in embed content");
      return null;
    }
    const winVideo = winVideoMatch[0];

    const winParamMatch = embedContent.match(/params:\s*\{([^}]*)\}/);
    if (!winParamMatch) {
      console.error("No params found in embed content");
      return null;
    }
    const winParamContent = winParamMatch[1];
    
    let jsonWinParam = "{" + winParamContent + "}";
    const jsonWinVideoNormal = "{" + winVideo.split("{")[1].split("}")[0] + "}";
    
    const pos = jsonWinParam.lastIndexOf(',');
    jsonWinParam = pos > -1 ? jsonWinParam.substring(0, pos) + jsonWinParam.substring(pos + 1) : jsonWinParam;
    jsonWinParam = jsonWinParam.replace(/'/g, '"');
    
    const videoNormal = JSON.parse(jsonWinVideoNormal);
    const param = JSON.parse(jsonWinParam);
    
    const url1 = `https://vixcloud.co/playlist/${videoNormal.id}?token=${param.token}&expires=${param.expires}&h=1`;
    const url2 = `https://vixcloud.co/playlist/${videoNormal.id}?b=1&token=${param.token}&expires=${param.expires}&h=1`;
    const url3 = `https://vixcloud.co/playlist/${videoNormal.id}?token=${param.token}&expires=${param.expires}`;
    const url4 = `https://vixcloud.co/playlist/${videoNormal.id}?b=1&token=${param.token}&expires=${param.expires}`;
    
    const headers = {
      'Referer': `https://vixcloud.co/embed/${videoNormal.id}`,
      'User-Agent': SC_HEADERS['User-Agent'],
      'X-Xsrf-Token': SC_HEADERS['X-Xsrf-Token'],
      'X-Inertia-Version': SC_INERTIA_VERSION
    };
    
    console.log("Trying URL1:", url1);
    try {
      const r1 = await fetch(url1, { method: 'HEAD', headers });
      if (r1.ok) {
        console.log("URL1 is working:", url1);
        return url1;
      }
    } catch (e) {
      console.error("Error checking URL1:", e);
    }
    
    console.log("Trying URL2:", url2);
    try {
      const r2 = await fetch(url2, { method: 'HEAD', headers });
      if (r2.ok) {
        console.log("URL2 is working:", url2);
        return url2;
      }
    } catch (e) {
      console.error("Error checking URL2:", e);
    }
    
    console.log("Trying URL3:", url3);
    try {
      const r3 = await fetch(url3, { method: 'HEAD', headers });
      if (r3.ok) {
        console.log("URL3 is working:", url3);
        return url3;
      }
    } catch (e) {
      console.error("Error checking URL3:", e);
    }
    
    console.log("Trying URL4:", url4);
    try {
      const r4 = await fetch(url4, { method: 'HEAD', headers });
      if (r4.ok) {
        console.log("URL4 is working:", url4);
        return url4;
      }
    } catch (e) {
      console.error("Error checking URL4:", e);
    }
    
    console.warn("No working URL found, returning URL1 as fallback");
    return url1;
  } catch (error) {
    console.error("Error parsing SC content:", error);
    return null;
  }
};

/**
 * Get StreamingCommunity token for a movie
 */
export const getScToken = async (id: string): Promise<string | null> => {
  try {
    const basicLink = `${SC_BASIC_URL}iframe/${id}`;
    const headers = { 
      ...SC_HEADERS, 
      'Referer': `${SC_BASIC_URL}watch/${id}` 
    };
    
    const response = await fetch(basicLink, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const iframe = doc.querySelector('iframe');
    
    if (!iframe || !iframe.src) {
      console.error("No iframe found in response");
      return null;
    }
    
    const embedUrl = iframe.src;
    const embedResponse = await fetch(embedUrl, { headers });
    
    if (!embedResponse.ok) {
      throw new Error(`HTTP error! status: ${embedResponse.status}`);
    }
    
    const embedText = await embedResponse.text();
    const embedDoc = parser.parseFromString(embedText, 'text/html');
    const script = embedDoc.body.querySelector('script');
    
    if (!script || !script.textContent) {
      console.error("No script found in embed response");
      return null;
    }
    
    return parseScContent(script.textContent);
  } catch (error) {
    console.error("Error getting SC token:", error);
    return null;
  }
};

/**
 * Get StreamingCommunity token for a TV episode
 */
export const getTvToken = async (episodeId: string, seriesId: string): Promise<string | null> => {
  try {
    const iframeUrl = `${SC_BASIC_URL}iframe/${seriesId}?episode_id=${episodeId}&next_episode=1`;
    const headers = { 
      ...SC_HEADERS, 
      'Referer': `${SC_BASIC_URL}watch/${seriesId}` 
    };
    
    console.log("Getting TV iframe from:", iframeUrl);
    const response = await fetch(iframeUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const iframe = doc.querySelector('iframe');
    
    if (!iframe || !iframe.src) {
      console.error("No iframe found in response");
      return null;
    }
    
    const embedUrl = iframe.src;
    console.log("Got TV embed URL:", embedUrl);
    
    const embedHeaders = { ...headers, 'Referer': iframeUrl };
    const embedResponse = await fetch(embedUrl, { headers: embedHeaders });
    
    if (!embedResponse.ok) {
      throw new Error(`HTTP error! status: ${embedResponse.status}`);
    }
    
    const embedText = await embedResponse.text();
    const embedDoc = parser.parseFromString(embedText, 'text/html');
    const script = embedDoc.body.querySelector('script');
    
    if (!script || !script.textContent) {
      console.error("No script found in embed response");
      return null;
    }
    
    return parseScContent(script.textContent);
  } catch (error) {
    console.error("Error getting TV token:", error);
    return null;
  }
};

/**
 * Fetch movies by genre
 */
export const fetchScMoviesByGenre = async (genre: number, page: number = 1): Promise<any[]> => {
  try {
    const offset = (page - 1) * 60; // 60 items per page
    const url = `${SC_BASIC_URL}api/archive?offset=${offset}&type=movie&genre[]=${genre}`;
    
    console.log(`Fetching movies for genre ${genre} at page ${page}:`, url);
    
    const response = await fetch(url, { headers: SC_HEADERS });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const movies = data.titles || [];
    console.log(`Found ${movies.length} movies for genre ${genre}`);
    
    // Enrich with TMDB info
    const enrichedMovies = await Promise.all(
      movies.map(async (movie: any) => {
        try {
          const tmdbData = await getTmdbInfo(movie.name, "movie");
          
          if (tmdbData?.results?.length > 0) {
            const movieInfo = tmdbData.results[0];
            return {
              ...movie,
              poster_path: movieInfo.poster_path,
              backdrop_path: movieInfo.backdrop_path,
              overview: movieInfo.overview,
              tmdbInfo: movieInfo
            };
          }
          
          return movie;
        } catch (error) {
          console.error("Error enriching movie:", error);
          return movie;
        }
      })
    );
    
    return enrichedMovies;
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    return [];
  }
};

/**
 * Search for movies
 */
export const searchMovies = async (searchTerm: string): Promise<any[]> => {
  try {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `${SC_BASIC_URL}api/search?q=${encodedSearchTerm}`;
    
    console.log("Search URL:", url);
    
    const response = await fetch(url, { headers: SC_HEADERS });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    const foundMovies = responseData.data?.filter((movie: any) => movie.type === 'movie') || [];
    
    console.log(`Found ${foundMovies.length} movies`);
    return foundMovies;
  } catch (error) {
    console.error("Error searching movies:", error);
    toast.error("Errore durante la ricerca dei film");
    return [];
  }
};

/**
 * Get number of seasons for a series
 */
export const getSeasonCount = async (code: string): Promise<number> => {
  try {
    const response = await fetch(`${SC_BASIC_URL}api/titles/preview/${code}`, {
      method: 'POST',
      headers: SC_HEADERS,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.seasons_count || 0;
  } catch (error) {
    console.error("Error getting season count:", error);
    return 0;
  }
};

/**
 * Get episodes for a season
 */
export const getEpisodes = async (seriesId: string, slug: string, seasonNumber: number): Promise<any[]> => {
  try {
    const seasonUrl = `${SC_BASIC_URL}titles/${slug}/stagione-${seasonNumber + 1}`;
    console.log("Requesting URL:", seasonUrl);
    
    const headers = {
      "Accept": "text/html, application/xhtml+xml",
      "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      "Content-Type": "application/json",
      "Dnt": "1",
      "Referer": SC_BASIC_URL,
      "User-Agent": SC_HEADERS['User-Agent'],
      "X-Inertia": "true",
      "X-Inertia-Version": SC_INERTIA_VERSION,
      "X-Requested-With": "XMLHttpRequest",
      "X-Xsrf-Token": SC_HEADERS['X-Xsrf-Token']
    };
    
    const response = await fetch(seasonUrl, { headers });
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Got JSON data:", data);
    
    if (data?.props?.loadedSeason?.episodes) {
      const episodes = data.props.loadedSeason.episodes.map((episode: any) => ({
        ...episode,
        series_id: seriesId,
        iframe_url: `${SC_BASIC_URL}iframe/${seriesId}?episode_id=${episode.id}&next_episode=1`
      }));
      console.log(`Found ${episodes.length} episodes`);
      return episodes;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting episodes:", error);
    return [];
  }
};

/**
 * Search for TV series
 */
export const searchSeries = async (searchTerm: string): Promise<any[]> => {
  try {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `${SC_BASIC_URL}api/search?q=${encodedSearchTerm}`;
    
    console.log("Search URL:", url);
    
    const response = await fetch(url, { headers: SC_HEADERS });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    const seriesResults = responseData.data?.filter((s: any) => s.type === 'tv') || [];
    
    console.log(`Found ${seriesResults.length} series`);
    return seriesResults;
  } catch (error) {
    console.error("Error searching series:", error);
    toast.error("Errore durante la ricerca delle serie TV");
    return [];
  }
};

/**
 * Get movie categories based on the category mapping
 */
export const getMovieCategories = (): { id: string; name: string; genreIds: number[] }[] => {
  return Object.entries(CATEGORY_MAPPING).map(([name, genreIds], index) => ({
    id: `category_${index}`,
    name,
    genreIds
  }));
};

/**
 * Fetch movies from a specific category
 */
export const fetchMoviesByCategory = async (category: { name: string; genreIds: number[] }, page: number = 1): Promise<any[]> => {
  try {
    let allMovies: any[] = [];
    
    // Fetch movies for each genre ID in the category
    for (const genreId of category.genreIds) {
      const movies = await fetchScMoviesByGenre(genreId, page);
      allMovies = [...allMovies, ...movies];
    }
    
    // Remove duplicates by ID
    const uniqueMovies = Object.values(
      allMovies.reduce((acc: Record<string, any>, movie) => {
        if (!acc[movie.id]) {
          acc[movie.id] = movie;
        }
        return acc;
      }, {})
    );
    
    console.log(`Found ${uniqueMovies.length} unique movies for category ${category.name}`);
    return uniqueMovies;
  } catch (error) {
    console.error(`Error fetching movies for category ${category.name}:`, error);
    return [];
  }
};
