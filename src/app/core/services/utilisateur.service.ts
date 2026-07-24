import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { StatutUtilisateur, UtilisateurListe } from '../../models/utilisateur.model';

export interface CreerUtilisateurEntree {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
}

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly http = inject(HttpClient);

  private readonly utilisateursSignal = signal<UtilisateurListe[]>([]);
  readonly utilisateurs = this.utilisateursSignal.asReadonly();

  charger() {
    return this.http
      .get<{ status: 'ok'; utilisateurs: UtilisateurListe[] }>(`${API_BASE_URL}/utilisateurs`)
      .pipe(tap((reponse) => this.utilisateursSignal.set(reponse.utilisateurs)));
  }

  creer(entree: CreerUtilisateurEntree) {
    return this.http
      .post<{ status: 'ok'; id: number }>(`${API_BASE_URL}/utilisateurs`, entree)
      .pipe(tap(() => this.charger().subscribe()));
  }

  changerStatut(id: number, statut: StatutUtilisateur) {
    return this.http
      .patch<{ status: 'ok'; message: string }>(`${API_BASE_URL}/utilisateurs/${id}/statut`, {
        statut,
      })
      .pipe(
        tap(() =>
          this.utilisateursSignal.update((liste) =>
            liste.map((u) => (u.id === id ? { ...u, statut } : u))
          )
        )
      );
  }
}
