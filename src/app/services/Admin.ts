import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donor, Gift, Winner } from '../models';
import { environment } from '../../environments/environment';

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  totalTicketsSold: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

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

  getGifts(): Observable<Gift[]> {
    return this.http.get<Gift[]>(`${this.apiUrl}/Gift`);
  }

  conductRaffle(giftId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Raffle/run/${giftId}`, {});
  }

  getWinners(): Observable<Winner[]> {
    return this.http.get<Winner[]>(`${this.apiUrl}/Winner`);
  }

  getRevenueReport(): Observable<RevenueReport> {
    return this.http.get<RevenueReport>(`${this.apiUrl}/Gift/sales-summary`);
  }

  getGiftsWithWinners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Gift/gifts-with-winners`);
  }
}
