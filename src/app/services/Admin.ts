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
  totalTicketsSold: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // 1. הזרקת ה-HttpClient
  private http = inject(HttpClient);

  // 2. כתובת ה-API (שני אותה לכתובת השרת האמיתית שלך)
  private apiUrl = 'http://localhost:5226/api';

  constructor() { }

  // --- חלק 1: ניהול תורמים ---

  getDonors(): Observable<Donor[]> {
    return this.http.get<Donor[]>(`${this.apiUrl}/Donor`);
  }

  addDonor(donor: Donor): Observable<Donor> {
    return this.http.post<Donor>(`${this.apiUrl}/Donor`, donor);
  }

  updateDonor(donor: Donor): Observable<Donor> {
    return this.http.put<Donor>(`${this.apiUrl}/Donor/${donor.id}`, donor);
  }

  deleteDonor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Donor/${id}`);
  }

  getGifts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Gift`);
  }

  conductRaffle(giftId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Raffle/run/${giftId}`, {});
  }

  getWinners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Winner`);
  }

  getRevenueReport(): Observable<RevenueReport> {
    return this.http.get<RevenueReport>(`${this.apiUrl}/Gift/sales-summary`);
  }

  getGiftsWithWinners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Gift/gifts-with-winners`);
  }
}
