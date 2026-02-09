/**
 * מודל מתנה
 * מגדיר את מבנה הנתונים של מתנה במערכת
 */
export interface Gift {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  ticketPrice: number;
  category: string;
  donorName: string;
  ticketsSold?: number;
  hasWinner?: boolean;
}