import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Winner } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  conductRaffle(giftId: number): Observable<Winner> {
    return this.http.post<Winner>(`${this.apiUrl}/Raffle/conduct/${giftId}`, {});
  }

  getWinners(): Observable<Winner[]> {
    return this.http.get<Winner[]>(`${this.apiUrl}/Winner`);
  }

  getRevenueReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Order/revenue-report`);
  }
}