import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { CSVExporter } from '../utils/csv.exporter';
import { PDFGenerator } from '../utils/pdf.generator';

export class AdminController {
  public async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getAdminAnalytics();
      res.json(analytics);
    } catch (err) {
      next(err);
    }
  }

  public async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getAdminAnalytics();
      const csv = CSVExporter.generateCSV([
        { Metric: 'Total Users', Value: analytics.totalUsers },
        { Metric: 'Total Listings', Value: analytics.totalListings },
        { Metric: 'Active Swaps', Value: analytics.activeSwaps },
        { Metric: 'Free Donations', Value: analytics.freeDonations },
        { Metric: 'Today Visitors', Value: analytics.visitorCountToday }
      ]);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=BookBridge_Analytics.csv');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }

  public async exportPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getAdminAnalytics();
      const pdfBuffer = await PDFGenerator.generateBookReportBuffer('BookBridge System Analytics Executive Summary', [
        { metric: 'Total Active Users', count: analytics.totalUsers },
        { metric: 'Total Listed Textbooks', count: analytics.totalListings },
        { metric: 'Active Book Swaps', count: analytics.activeSwaps },
        { metric: 'Free Donations', count: analytics.freeDonations }
      ]);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=BookBridge_Analytics.pdf');
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
