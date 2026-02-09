import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donor } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonorService {
  private apiUrl = `${environment.apiUrl}/Donor`;

  constructor(private http: HttpClient) {}

  getDonors(): Observable<Donor[]> {
    return this.http.get<Donor[]>(this.apiUrl);
  }

  getDonorById(id: number): Observable<Donor> {
    return this.http.get<Donor>(`${this.apiUrl}/${id}`);
  }

  addDonor(donor: Omit<Donor, 'id' | 'gifts'>): Observable<Donor> {
    return this.http.post<Donor>(this.apiUrl, donor);
  }

  updateDonor( id: number, donor: any): Observable<Donor> {
    return this.http.put<any>(`${this.apiUrl}/${donor.id}`, donor);
  }

  deleteDonor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
