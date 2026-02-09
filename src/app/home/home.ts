import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [ RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})

export class Home implements OnInit {
  authService = inject(AuthService);

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToGifts() {
    this.router.navigate(['/catalog']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
