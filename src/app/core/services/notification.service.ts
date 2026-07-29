import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../api-config';
import { NotificationTache } from '../../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);

  private readonly notificationsSignal = signal<NotificationTache[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly nbNonLues = computed(() => this.notificationsSignal().filter((n) => !n.lue).length);

  // Ids déjà vus -- sert à détecter les notifications réellement nouvelles
  // (pas juste "toujours non lues") lors d'un rechargement complet.
  private idsConnus = new Set<number>();
  private premierChargement = true;
  private socket?: Socket;

  charger() {
    return this.http
      .get<{ status: 'ok'; notifications: NotificationTache[] }>(`${API_BASE_URL}/notifications`)
      .pipe(tap((reponse) => this.traiterReponse(reponse.notifications)));
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

  // Ouvre la connexion WebSocket temps réel. Idempotent : un appel répété
  // sans deconnecterTempsReel() entre-deux ne recrée pas de socket.
  connecterTempsReel(): void {
    if (this.socket) return;
    this.socket = io(SOCKET_URL, { withCredentials: true });

    // Couvre initial connect + reconnexions auto de socket.io : le serveur
    // ne rejoue pas les événements manqués pendant une déconnexion, donc on
    // resynchronise la liste complète à chaque (re)connexion plutôt que de
    // ne compter que sur les événements poussés en direct.
    this.socket.on('connect', () => this.charger().subscribe());

    this.socket.on('notification:new', (notif: NotificationTache) => {
      this.notificationsSignal.update((liste) => [notif, ...liste]);
      this.idsConnus.add(notif.id);
      this.signalerNouvelle(notif);
    });
  }

  deconnecterTempsReel(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  // Remet le service à son état initial -- à appeler à chaque changement de
  // session (logout, session expirée) pour éviter que les notifications
  // (et les ids déjà vus) d'un compte ne fuitent vers le suivant sur un
  // même poste.
  reinitialiser(): void {
    this.deconnecterTempsReel();
    this.idsConnus = new Set();
    this.premierChargement = true;
    this.notificationsSignal.set([]);
  }

  private traiterReponse(notifications: NotificationTache[]): void {
    if (!this.premierChargement) {
      const nouvelles = notifications.filter((n) => !this.idsConnus.has(n.id));
      this.signalerNouvelles(nouvelles);
    }
    this.idsConnus = new Set(notifications.map((n) => n.id));
    this.premierChargement = false;
    this.notificationsSignal.set(notifications);
  }

  // MatSnackBar n'affiche qu'un pop-up à la fois : en ouvrir plusieurs à la
  // suite (une par notification) fait disparaître les précédentes avant
  // même que l'utilisateur les voie. On regroupe donc les arrivées
  // multiples en un seul pop-up récapitulatif.
  private signalerNouvelles(nouvelles: NotificationTache[]): void {
    if (nouvelles.length === 0) return;
    if (nouvelles.length === 1) {
      this.signalerNouvelle(nouvelles[0]);
      return;
    }
    this.snackBar.open(`${nouvelles.length} nouvelles notifications`, 'Fermer', {
      duration: 12000,
    });
  }

  // Le pop-up ne révèle le contenu qu'au clic, moment où il est aussi
  // marqué comme lu -- les deux actions vont ensemble, jamais l'une sans
  // l'autre.
  private signalerNouvelle(notif: NotificationTache): void {
    const ref = this.snackBar.open('Nouvelle notification reçue', 'Voir', { duration: 12000 });
    ref.onAction().subscribe(() => {
      this.snackBar.open(notif.message, 'Fermer', { duration: 8000 });
      this.marquerLue(notif.id).subscribe();
    });
  }
}
