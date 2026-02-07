import { Component, signal } from '@angular/core';
import { GiftList } from './gift-list/gift-list';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services';
import { DonorListComponent } from './components/donor/donor';
import { NavbarComponent } from './components/navbar/navbar';
import { Home} from './home/home';
import { CatalogComponent } from './catalog/catalog';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule,GiftList,DonorListComponent,NavbarComponent,Home],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('מערכת ההגרלות');

  constructor(public authService: AuthService) {}
}