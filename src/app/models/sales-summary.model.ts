export interface GiftSalesDto {
  giftName: string;
  purchaseCount: number;
  revenueFromGift: number;
}

export interface SalesSummaryDto {
  totalRevenue: number;
  totalTicketsSold: number;
  salesPerGift: GiftSalesDto[];
}
