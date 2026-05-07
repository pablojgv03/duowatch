export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    friends: number;
    liked: number;
    matches: number;
  };
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  stats?: {
    friends: number;
    matches: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Friendship {
  friendshipId: string;
  since: string;
  friend: PublicUser;
}

export interface FriendRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  requester?: PublicUser;
  receiver?: PublicUser;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  favoriteGenres: number[];
  preferredTypes: string[];
  minRating: number;
  languages: string[];
}

export type MediaType = 'MOVIE' | 'TV';
export type InteractionType = 'LIKED' | 'DISLIKED' | 'WATCHED' | 'WANT_TO_WATCH';

export interface MovieInteraction {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: MediaType;
  action: InteractionType;
  rating: number | null;
  title: string;
  posterPath: string | null;
  createdAt: string;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  overview: string | null;
  voteAverage: number;
  score: number;
  createdAt: string;
  userA?: PublicUser;
  userB?: PublicUser;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'MATCH' | 'RECOMMENDATION' | 'SYSTEM';
  title: string;
  message: string;
  data: Record<string, any> | null;
  read: boolean;
  createdAt: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  media_type?: 'movie';
  posterUrl?: string | null;
  backdropUrl?: string | null;
  score?: number;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  media_type?: 'tv';
  posterUrl?: string | null;
  backdropUrl?: string | null;
  score?: number;
}

export type TMDBMediaItem = (TMDBMovie | TMDBTVShow) & {
  media_type: 'movie' | 'tv';
};

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface MatchStats {
  total: number;
  byType: { movie: number; tv: number };
  topFriendId?: string;
  averageScore: number;
}

export function getMediaTitle(item: TMDBMediaItem): string {
  return 'title' in item ? item.title : item.name;
}

export function getMediaDate(item: TMDBMediaItem): string {
  return 'release_date' in item ? item.release_date : item.first_air_date;
}
