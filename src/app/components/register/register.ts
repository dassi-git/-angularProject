import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services';
import { User } from '../../models';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  user: User = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Customer'
  };
  
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  
  // שגיאות לכל שדה
  nameError = '';
  emailError = '';
  phoneError = '';
  passwordError = '';
  confirmPasswordError = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.isLoading = false;
        // אחרי רישום מוצלח, ניתן להתחבר אוטומטית
        if (response.token) {
          // אם יש טוקן, המשתמש כבר מחובר
          this.router.navigate(['/cart']);
        } else {
          // אם אין טוקן, ניתן להתחברות
          alert('הרשמה הצליחה! עכשיו אתה יכול להתחבר.');
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        
        if (error.error && typeof error.error === 'object') {
          if (error.error.error) {
            // שגיאה מהשרת
            this.errorMessage = error.error.error;
          } else if (error.error.errors) {
            // שגיאות ולידציה
            const errors = Object.values(error.error.errors).flat();
            this.errorMessage = errors.join(', ');
          } else {
            this.errorMessage = JSON.stringify(error.error);
          }
        } else if (error.error && typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else {
          this.errorMessage = 'שגיאה ברישום. אנא נסה שוב.';
        }
      }
    });
  }

  // ולידציה בזמן אמת
  validateName(): void {
    if (!this.user.name) {
      this.nameError = 'שם הוא שדה חובה';
    } else if (!/^[\p{L}\s'\-]+$/u.test(this.user.name)) {
      this.nameError = 'השם יכול לכלול רק אותיות ורווחים';
    } else {
      this.nameError = '';
    }
  }

  validateEmail(): void {
    if (!this.user.email) {
      this.emailError = 'אימייל הוא שדה חובה';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.user.email)) {
      this.emailError = 'פורמט אימייל לא תקין';
    } else {
      this.emailError = '';
    }
  }

  validatePhone(): void {
    if (!this.user.phone) {
      this.phoneError = 'טלפון הוא שדה חובה';
    } else if (!/^[0-9]+$/.test(this.user.phone)) {
      this.phoneError = 'הטלפון חייב לכלול רק מספרים';
    } else {
      this.phoneError = '';
    }
  }

  validatePassword(): void {
    if (!this.user.password) {
      this.passwordError = 'סיסמה היא שדה חובה';
    } else if (this.user.password.length < 6) {
      this.passwordError = 'הסיסמה חייבת להיות באורך 6 תווים לפחות';
    } else if (!/\d/.test(this.user.password)) {
      this.passwordError = 'הסיסמה חייבת לכלול לפחות מספר אחד';
    } else {
      this.passwordError = '';
    }
  }

  validateConfirmPassword(): void {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'אישור סיסמה הוא שדה חובה';
    } else if (this.user.password !== this.confirmPassword) {
      this.confirmPasswordError = 'הסיסמאות אינן זהות';
    } else {
      this.confirmPasswordError = '';
    }
  }

  private validateForm(): boolean {
    if (!this.user.name || !this.user.email || !this.user.phone || !this.user.password) {
      this.errorMessage = 'אנא מלא את כל השדות';
      return false;
    }

    if (this.user.password !== this.confirmPassword) {
      this.errorMessage = 'הסיסמאות אינן זהות';
      return false;
    }

    if (this.user.password.length < 6) {
      this.errorMessage = 'הסיסמה חייבת להיות באורך 6 תווים לפחות';
      return false;
    }

    if (!/\d/.test(this.user.password)) {
      this.errorMessage = 'הסיסמה חייבת לכלול לפחות מספר אחד';
      return false;
    }

    this.user.role = 'Customer';
    return true;
  }
}
