/**
 * מודל מתנה
 * מגדיר את מבנה הנתונים של מתנה במערכת
 */
export interface Gift {
  id: number; // מזהה ייחודי של המתנה
  name: string; // שם המתנה
  description?: string; // תיאור המתנה (אופציונלי)
  ticketPrice: number; // מחיר כרטיס למתנה
  category: string; // קטגוריה של המתנה
  donorName: string; // שם התורם
}