import { 
  ApplicationConfig, 
  provideBrowserGlobalErrorListeners, 
  // 1. החלפת הייבוא ל-Zonel
provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // 2. הגדרת Change Detection ללא Zone.js (קריטי בגלל השינוי ב-package.json)
    provideZonelessChangeDetection(),
    
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    
    // 3. איחוד ה-HttpClient להגדרה אחת נקייה
    provideHttpClient(withInterceptorsFromDi()),
    
    // הגדרת האינטרספטור (נשאר כפי שהיה)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
