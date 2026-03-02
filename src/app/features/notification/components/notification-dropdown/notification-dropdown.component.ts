import {
  Component,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NotificationState } from '../../state/notification.state';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.css'
})
export class NotificationDropdownComponent {

  open = false;

  constructor(
    public notificationState: NotificationState,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.notificationState.startPolling();
  }

  toggle(): void {
    this.open = !this.open;
  }

  openNotification(notification: Notification, event: MouseEvent): void {
    event.stopPropagation();
    this.open = false;
    this.notificationState.openNotification(notification);
  }

  goToAll(event: MouseEvent): void {
    event.stopPropagation();
    this.open = false;
    this.router.navigate(['/notifications']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.open &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.open = false;
    }
  }
}
