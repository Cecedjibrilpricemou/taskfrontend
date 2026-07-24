import { Component, ViewChild, inject, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { StatutUtilisateur, UtilisateurListe } from '../../../models/utilisateur.model';
import { classeStatutUtilisateur, libelleStatutUtilisateur } from '../../../shared/badges';
import { CreerUtilisateurDialog } from './creer-utilisateur-dialog/creer-utilisateur-dialog';
import {
  ConfirmDialog,
  DonneesConfirmDialog,
} from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-utilisateurs',
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.scss',
})
export class Utilisateurs {
  protected readonly utilisateurService = inject(UtilisateurService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly colonnes = ['nom', 'email', 'role', 'statut', 'derniere_connexion', 'actions'];
  protected readonly libelleStatut = libelleStatutUtilisateur;
  protected readonly classeStatut = classeStatutUtilisateur;

  protected readonly enChargement = signal(true);
  protected readonly source = new MatTableDataSource<UtilisateurListe>([]);

  @ViewChild(MatPaginator) set paginator(mp: MatPaginator) {
    if (mp) this.source.paginator = mp;
  }

  constructor() {
    this.charger();
  }

  private charger(): void {
    this.enChargement.set(true);
    this.utilisateurService.charger().subscribe({
      next: (reponse) => {
        this.source.data = reponse.utilisateurs;
        this.enChargement.set(false);
      },
      error: () => {
        this.enChargement.set(false);
        this.snackBar.open('Impossible de charger les utilisateurs', 'Fermer', { duration: 4000 });
      },
    });
  }

  ouvrirCreation(): void {
    this.dialog
      .open(CreerUtilisateurDialog)
      .afterClosed()
      .subscribe((succes) => {
        if (succes) {
          this.source.data = this.utilisateurService.utilisateurs();
          this.snackBar.open('Utilisateur créé avec succès', 'Fermer', { duration: 4000 });
        }
      });
  }

  demanderChangementStatut(utilisateur: UtilisateurListe, nouveauStatut: StatutUtilisateur): void {
    if (nouveauStatut === utilisateur.statut) return;

    const donnees: DonneesConfirmDialog = {
      titre: 'Changer le statut',
      message: `Confirmer le passage de ${utilisateur.prenom} ${utilisateur.nom} au statut « ${libelleStatutUtilisateur(nouveauStatut)} » ?`,
      texteConfirmer: 'Confirmer',
      destructif: nouveauStatut === 'bloque' || nouveauStatut === 'desactive',
    };

    this.dialog
      .open(ConfirmDialog, { data: donnees })
      .afterClosed()
      .subscribe((confirme) => {
        if (!confirme) return;

        this.utilisateurService.changerStatut(utilisateur.id, nouveauStatut).subscribe({
          next: () => {
            this.source.data = this.utilisateurService.utilisateurs();
            this.snackBar.open('Statut mis à jour', 'Fermer', { duration: 4000 });
          },
          error: () => {
            this.snackBar.open('Impossible de mettre à jour le statut', 'Fermer', { duration: 4000 });
          },
        });
      });
  }
}
