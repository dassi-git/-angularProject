import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gift } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GiftService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Gift`;

  constructor() {}

  getGifts(name?: string, donorName?: string, minPurchasers?: number | null): Observable<Gift[]> {
    let params = new HttpParams()
      .set('name', name?.trim() ?? '')
      .set('donorName', donorName ?? '');

    if (minPurchasers !== null && minPurchasers !== undefined && minPurchasers > 0) {
      params = params.set('minPurchasers', String(minPurchasers));
    }

    params = this.compactParams(params, ['name', 'donorName']);
    
    return this.http.get<Gift[]>(this.apiUrl, { params });
  }

  getGiftById(id: number): Observable<Gift> {
    return this.http.get<Gift>(`${this.apiUrl}/${id}`);
  }

  searchGifts(name?: string, donor?: string, minPrice?: number, maxPrice?: number): Observable<Gift[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (donor) params = params.set('donor', donor);
    if (minPrice !== undefined && minPrice !== null) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined && maxPrice !== null) params = params.set('maxPrice', maxPrice.toString());
    
    return this.http.get<Gift[]>(`${this.apiUrl}/search`, { params });
  }

  addGift(gift: Omit<Gift, 'id'>): Observable<string> {
    const payload = {
      ...gift,
      name: gift.name?.trim() ?? ''
    };

    return this.http.post(this.apiUrl, payload, { responseType: 'text' });
  }

  updateGift(gift: Gift): Observable<string> {
    return this.http.put(`${this.apiUrl}`, gift, { responseType: 'text' });
  }

  deleteGift(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  private compactParams(params: HttpParams, keys: string[]): HttpParams {
    return keys.reduce((acc, key) => {
      const value = acc.get(key);
      return value ? acc : acc.delete(key);
    }, params);
  }
}
