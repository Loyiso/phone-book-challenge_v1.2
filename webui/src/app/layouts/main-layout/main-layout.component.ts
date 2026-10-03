import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainnavComponent } from '../../navbar/mainnav/mainnav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [MainnavComponent, RouterOutlet],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {}