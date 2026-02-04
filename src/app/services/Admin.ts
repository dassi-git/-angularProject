import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// הגדרת ממשקים (Interfaces) כדי שהקוד יהיה קריא ובטוח
export interface Donor {
  id?: number;
  name: string;
  email: string;
  address: string;
}

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  totalTickets: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // 1. הזרקת ה-HttpClient
  private http = inject(HttpClient);

  // 2. כתובת ה-API (שני אותה לכתובת השרת האמיתית שלך)
  private apiUrl = 'http://localhost:5000/api/admin';

  constructor() { }

  // --- חלק 1: ניהול תורמים ---

  getDonors(): Observable<Donor[]> {
    return this.http.get<Donor[]>(`${this.apiUrl}/donors`);
  }

  addDonor(donor: Donor): Observable<Donor> {
    return this.http.post<Donor>(`${this.apiUrl}/donors`, donor);
  }

  updateDonor(donor: Donor): Observable<Donor> {
    return this.http.put<Donor>(`${this.apiUrl}/donors/${donor.id}`, donor);
  }

  deleteDonor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/donors/${id}`);
  }

  // --- חלק 2: ניהול מתנות והגרלות ---

  getGifts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/gifts`);
  }

  // הפעולה שמפעילה את ההגרלה בשרת
  conductRaffle(giftId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/raffles/draw/${giftId}`, {});
  }

  // קבלת רשימת הזוכים
  getWinners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/winners`);
  }

  // --- חלק 3: דוחות ---

  getRevenueReport(): Observable<RevenueReport> {
    return this.http.get<RevenueReport>(`${this.apiUrl}/reports/revenue`);
  }
}