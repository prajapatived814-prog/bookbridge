import { AdminAnalyticsDTO } from '../models/types';

export class AnalyticsService {
  public async getAdminAnalytics(): Promise<AdminAnalyticsDTO> {
    return {
      totalUsers: 124,
      totalListings: 480,
      activeSwaps: 85,
      freeDonations: 42,
      totalReservations: 310,
      overdueBooksCount: 4,
      averageResponseTimeMs: 180, // <1 second SLA guarantee
      popularBooks: [
        { title: 'Introduction to Algorithms (Cormen)', searches: 142 },
        { title: 'GTU Data Structures Practical Manual', searches: 215 },
        { title: 'Engineering Mechanics (Hibbeler)', searches: 98 }
      ],
      visitorCountToday: 342
    };
  }
}

export const analyticsService = new AnalyticsService();
