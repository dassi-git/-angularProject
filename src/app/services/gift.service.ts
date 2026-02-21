import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gift } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GiftService {
  private apiUrl = `${environment.apiUrl}/Gift`;

  constructor(private http: HttpClient) {}

  getGifts(name?: string, donorName?: string, minPurchasers?: number | null): Observable<Gift[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (donorName) params = params.set('donorName', donorName);
    if (minPurchasers) params = params.set('minPurchasers', minPurchasers.toString());
    
    return this.http.get<Gift[]>(this.apiUrl, { params });
  }

  getGiftById(id: number): Observable<Gift> {
    return this.http.get<Gift>(`${this.apiUrl}/${id}`);
  }

  searchGifts(name?: string, donor?: string, minPrice?: number, maxPrice?: number): Observable<Gift[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (donor) params = params.set('donor', donor);
    if (minPrice) params = params.set('minPrice', minPrice.toString());
    if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
    
    return this.http.get<Gift[]>(`${this.apiUrl}/search`, { params });
  }

  addGift(gift: Omit<Gift, 'id'>): Observable<any> {
    if(gift.name){
      gift.name = gift.name.trim();
    }
    return this.http.post(this.apiUrl, gift, { responseType: 'text' });
  }

  updateGift(gift: Gift): Observable<any> {
    return this.http.put(`${this.apiUrl}`, gift, { responseType: 'text' });
  }

  deleteGift(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
