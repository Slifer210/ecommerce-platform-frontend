import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reports-home.component.html'
})
export class ReportsHomeComponent {}
