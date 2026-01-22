import { Component, signal } from '@angular/core';


import { GiftList } from './gift-list/gift-list';

import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule,GiftList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('מערכת ההגרלות');

  constructor(public authService: AuthService) {}
}