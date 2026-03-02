import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-rating-stars',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="flex gap-0.5">
        <ng-container *ngFor="let i of stars">
            <span
            class="text-sm"
            [class.text-blue-600]="i <= rating"
            [class.text-gray-300]="i > rating">
            ★
            </span>
        </ng-container>
        </div>
    `
})
export class RatingStarsComponent {
    @Input() rating = 0;
    stars = [1, 2, 3, 4, 5];
}
