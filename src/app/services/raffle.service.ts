import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Winner } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  constructor() {}

  conductRaffle(giftId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Raffle/conduct/${giftId}`, {});
  }

  getWinners(): Observable<Winner[]> {
    return this.http.get<Winner[]>(`${this.apiUrl}/Winner`);
  }

  getRevenueReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Order/revenue-report`);
  }
}
