import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donor } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Donor`;

  constructor() {}

  getDonors(): Observable<Donor[]> {
    return this.http.get<Donor[]>(this.apiUrl);
  }

    getDonorById(id: number): Observable<Donor> {
    return this.http.get<Donor>(`${this.apiUrl}/${id}`);
  }
    addDonor(donor: Omit<Donor, 'id' | 'gifts'>): Observable<Donor> {
      return this.http.post<Donor>(this.apiUrl, donor);
    }

    updateDonor(id: number, donor: Partial<Donor>): Observable<Donor> {
      return this.http.put<Donor>(`${this.apiUrl}/${id}`, donor);
  }

  deleteDonor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
