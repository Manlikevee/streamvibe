export type MediaKind = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface Title {
  id: number | string;
  kind: MediaKind;
  title: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  date: string;
  rating: number; // TMDB vote_average (0-10)
  votes: number;
  popularity: number;
  genreIds: number[];
  libraryId?: string;
  streamUrl?: string;
}

export interface Person {
  id: number;
  name: string;
  role?: string;
  image: string | null;
}

export interface Review {
  id: string;
  author: string;
  rating: number | null;
  content: string;
  avatar: string | null;
}

export interface Episode {
  id: number | string;
  number: number;
  name: string;
  overview: string;
  runtime: number | null;
  still: string | null;
  streamUrl?: string;
}

export interface Season {
  id: number | string;
  number: number;
  name: string;
  episodeCount: number;
  year: string;
  episodes?: Episode[];
}

export interface Detail extends Title {
  runtime: number | null;
  year: string;
  languages: string[];
  genres: string[];
  director: Person | null;
  music: Person | null;
  cast: Person[];
  reviews: Review[];
  seasons: Season[];
}
