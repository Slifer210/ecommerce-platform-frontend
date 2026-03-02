import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-base',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-base.component.html',
  styleUrls: ['./header-base.component.css']
})
export class HeaderBaseComponent {
  @Input() homeLink: string = '/';
}
