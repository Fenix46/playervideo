
// Types for Video On Demand (VOD) functionality

export interface ScMovie {
  id: string;
  name: string;
  type: 'movie';
  slug: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  title?: string;
  tmdbInfo?: any;
}

export interface ScSeries {
  id: string;
  name: string;
  type: 'tv';
  slug: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  title?: string;
  tmdbInfo?: any;
  seasons_count?: number;
}

export interface ScEpisode {
  id: string;
  title: string;
  number: number;
  series_id: string;
  season_number: number;
  iframe_url: string;
}

export interface ScSeason {
  id: string;
  number: number;
  episodes: ScEpisode[];
}

export interface PlaybackSource {
  type: 'sc_movie' | 'episode';
  url: string;
  title: string;
  movieId?: string;
  episodeId?: string;
  seriesId?: string;
  headers?: Record<string, string>;
}
