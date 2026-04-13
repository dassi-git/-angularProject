import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        console.error('HTTP Error:', error);

        let message = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';

        if (error.status === 0) {
          message = 'לא ניתן להתחבר לשרת. בדוק את חיבור האינטרנט.';
        } else if (error.status === 401) {
          message = 'הגישה נדחתה. יש לבצע התחברות.';
        } else if (error.status === 403) {
          message = 'אין לך הרשאה לבצע פעולה זו.';
        } else if (error.status === 404) {
          message = 'המשאב לא נמצא.';
        } else if (error.status >= 500) {
          message = 'שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר.';
        } else if (error.error && typeof error.error === 'object' && 'message' in error.error) {
          message = (error.error as { message?: string }).message || message;
        }

        toastService.error(message);
      } else {
        console.error('Unknown HTTP error:', error);
        toastService.error('אירעה שגיאה לא מזוהה. אנא נסה שוב.');
      }

      return throwError(() => error);
    })
  );
};
