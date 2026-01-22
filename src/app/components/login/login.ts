import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services';
import { LoginDTO } from '../../models';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials: LoginDTO = { email: '', password: '' };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'אנא מלא את כל השדות';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.user?.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cart']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'שם משתמש או סיסמה שגויים';
      }
    });
  }

  // לבדיקה מהירה - התחברות כמנהל
  loginAsAdmin(): void {
    this.credentials = { email: 'admin@test.com', password: 'admin123' };
    this.login();
  }

  // לבדיקה מהירה - התחברות כלקוח
  loginAsCustomer(): void {
    this.credentials = { email: 'user@test.com', password: 'user123' };
    this.login();
  }
}
