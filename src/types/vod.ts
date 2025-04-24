
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
  genres?: number[];
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
  genres?: number[];
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

export interface ScCategory {
  id: string;
  name: string;
  genreIds: number[];
  posterPath?: string;
}

export const CATEGORY_MAPPING: Record<string, number[]> = {
  "Animazione": [19],
  "Azione": [4, 13],
  "Avventura": [11],
  "Commedia": [12],
  "Fantascienza": [10, 3],
  "Guerra": [9, 17],
  "Horror": [7],
  "Dramma": [1],
  "Family": [16, 25],
  "Crime": [2],
  "Story": [22],
  "Mistery": [6],
  "Romance": [15],
  "Thriller": [5],
  "Western": [20]
};
