import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationState } from '../../state/notification.state';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-page.component.html'
})
export class NotificationsPageComponent implements OnInit {

  constructor(
    public notificationState: NotificationState
  ) {}

  ngOnInit(): void {
    this.notificationState.loadAll();
  }

  open(notification: Notification): void {
    this.notificationState.openNotification(notification);
  }
}
