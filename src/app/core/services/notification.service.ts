import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { NotificationTache } from '../../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  private readonly notificationsSignal = signal<NotificationTache[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly nbNonLues = computed(() => this.notificationsSignal().filter((n) => !n.lue).length);

  charger() {
    return this.http
      .get<{ status: 'ok'; notifications: NotificationTache[] }>(`${API_BASE_URL}/notifications`)
      .pipe(tap((reponse) => this.notificationsSignal.set(reponse.notifications)));
  }

  marquerLue(id: number) {
    return this.http
      .patch<{ status: 'ok' }>(`${API_BASE_URL}/notifications/${id}/lue`, {})
      .pipe(
        tap(() =>
          this.notificationsSignal.update((liste) =>
            liste.map((n) => (n.id === id ? { ...n, lue: true } : n))
          )
        )
      );
  }
}
