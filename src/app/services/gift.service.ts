import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gift } from '../models';
import { environment } from '../../environments/environment';

/**
 * שירות לניהול מתנות
 * מספק פונקציות CRUD למתנות וחיפוש
 */
@Injectable({
  providedIn: 'root' // זמין בכל האפליקציה
})
export class GiftService {
  private apiUrl = `${environment.apiUrl}/Gift`; // כתובת ה-API למתנות

  constructor(private http: HttpClient) {} // הזרקת HTTP client

  /**
   * מחזיר את כל המתנות
   */
  getGifts(): Observable<Gift[]> {
    return this.http.get<Gift[]>(this.apiUrl);
  }

  /**
   * מחזיר מתנה ספציפית לפי ID
   */
  getGiftById(id: number): Observable<Gift> {
    return this.http.get<Gift>(`${this.apiUrl}/${id}`);
  }

  /**
   * מחפש מתנות לפי קריטריונים שונים
   */
  searchGifts(name?: string, donor?: string, minPrice?: number, maxPrice?: number): Observable<Gift[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (donor) params = params.set('donor', donor);
    if (minPrice) params = params.set('minPrice', minPrice.toString());
    if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
    
    return this.http.get<Gift[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * מוסיף מתנה חדשה
   */
  addGift(gift: Omit<Gift, 'id'>): Observable<any> {
    return this.http.post(this.apiUrl, gift, { responseType: 'text' });
  }

  /**
   * מעדכן מתנה קיימת
   */
  updateGift(gift: Gift): Observable<any> {
    return this.http.put(`${this.apiUrl}`, gift, { responseType: 'text' });
  }

  /**
   * מוחק מתנה
   */
  deleteGift(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}