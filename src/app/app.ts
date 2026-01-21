import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GiftList } from './gift-list/gift-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GiftList],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('project');
}
 