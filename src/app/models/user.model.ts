/**
 * מודל משתמש
 */
export interface User {
  id?: number; // מזהה ייחודי (אופציונלי)
  name: string; // שם המשתמש
  email: string; // כתובת אימייל
  phone: string; // מספר טלפון
  password: string; // סיסמה
  role: string; // תפקיד (לקוח/מנהל)
}

/**
 * מודל לכניסה
 */
export interface LoginDTO {
  email: string; // כתובת אימייל
  password: string; // סיסמה
}
