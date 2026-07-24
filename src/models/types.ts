export type RoleType = 'STUDENT' | 'FACULTY' | 'ADMIN';
export type BookModeType = 'SELL' | 'EXCHANGE' | 'DONATE';

export interface BookSearchFilters {
  query?: string;
  category?: string;
  subject?: string;
  branch?: string;
  semester?: number;
  edition?: string;
  condition?: string;
  mode?: BookModeType;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface AdminAnalyticsDTO {
  totalUsers: number;
  totalListings: number;
  activeSwaps: number;
  freeDonations: number;
  totalReservations: number;
  overdueBooksCount: number;
  averageResponseTimeMs: number;
  popularBooks: any[];
  visitorCountToday: number;
}
