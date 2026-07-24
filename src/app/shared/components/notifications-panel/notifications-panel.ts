import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications-panel',
  imports: [DatePipe, MatIconModule, MatListModule, MatButtonModule],
  templateUrl: './notifications-panel.html',
  styleUrl: './notifications-panel.scss',
})
export class NotificationsPanel {
  protected readonly notificationService = inject(NotificationService);

  ouvrir(id: number, dejaLue: boolean): void {
    if (dejaLue) return;
    this.notificationService.marquerLue(id).subscribe();
  }
}
