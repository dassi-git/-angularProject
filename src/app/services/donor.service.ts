import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donor } from '../models';
import { environment } from '../../environments/environment';

type CreateDonorDto = Omit<Donor, 'id' | 'gifts'>;
type UpdateDonorDto = Partial<CreateDonorDto>;

@Injectable({
  providedIn: 'root'
})
export class DonorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Donor`;

  getDonors(): Observable<Donor[]> {
    return this.http.get<Donor[]>(this.apiUrl);
  }

  getDonorById(id: number): Observable<Donor> {
    this.assertValidId(id);
    return this.http.get<Donor>(`${this.apiUrl}/${id}`);
  }

  addDonor(donor: CreateDonorDto): Observable<Donor> {
    return this.http.post<Donor>(this.apiUrl, this.normalizeDonorPayload(donor));
  }

  updateDonor(id: number, donor: UpdateDonorDto): Observable<Donor> {
    this.assertValidId(id);
    return this.http.put<Donor>(`${this.apiUrl}/${id}`, this.normalizeDonorPayload(donor));
  }

  deleteDonor(id: number): Observable<void> {
    this.assertValidId(id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private assertValidId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid donor id');
    }
  }

  private normalizeDonorPayload(donor: UpdateDonorDto): UpdateDonorDto {
    return {
      ...donor,
      name: donor.name?.trim(),
      email: donor.email?.trim(),
      address: donor.address?.trim()
    };
  }
}
