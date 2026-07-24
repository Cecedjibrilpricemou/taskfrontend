import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationsPanel } from '../../shared/components/notifications-panel/notifications-panel';
import { MotDePasseDialog } from '../../shared/components/mot-de-passe-dialog/mot-de-passe-dialog';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    NotificationsPanel,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly sidenavOuvert = signal(true);

  protected readonly estMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 768px)').pipe(map((etat) => etat.matches)),
    { initialValue: false }
  );

  protected readonly liensAdmin = [
    { route: '/admin/utilisateurs', icone: 'group', label: 'Utilisateurs' },
    { route: '/admin/taches', icone: 'checklist', label: 'Tâches' },
    { route: '/admin/tableau-de-bord', icone: 'bar_chart', label: 'Tableau de bord' },
  ];

  constructor() {
    this.notificationService.charger().subscribe();

    effect(() => {
      this.sidenavOuvert.set(!this.estMobile());
    });
  }

  basculerSidenav(): void {
    this.sidenavOuvert.set(!this.sidenavOuvert());
  }

  fermerSidenavSiMobile(): void {
    if (this.estMobile()) {
      this.sidenavOuvert.set(false);
    }
  }

  ouvrirMotDePasse(): void {
    this.dialog
      .open(MotDePasseDialog)
      .afterClosed()
      .subscribe((succes) => {
        if (succes) {
          this.snackBar.open('Mot de passe modifié avec succès', 'Fermer', { duration: 4000 });
        }
      });
  }

  deconnexion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
