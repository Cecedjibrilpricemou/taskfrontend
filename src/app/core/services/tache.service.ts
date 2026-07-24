import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import {
  CreerTacheEntree,
  MaTache,
  ModifierTacheEntree,
  PrioriteTache,
  StatutTache,
  TacheListe,
} from '../../models/tache.model';

@Injectable({ providedIn: 'root' })
export class TacheService {
  private readonly http = inject(HttpClient);

  private readonly tachesSignal = signal<TacheListe[]>([]);
  readonly taches = this.tachesSignal.asReadonly();

  private readonly mesTachesSignal = signal<MaTache[]>([]);
  readonly mesTaches = this.mesTachesSignal.asReadonly();

  chargerToutes(filtres?: { statut?: StatutTache; priorite?: PrioriteTache }) {
    let params = new HttpParams();
    if (filtres?.statut) params = params.set('statut', filtres.statut);
    if (filtres?.priorite) params = params.set('priorite', filtres.priorite);

    return this.http
      .get<{ status: 'ok'; taches: TacheListe[] }>(`${API_BASE_URL}/taches`, { params })
      .pipe(tap((reponse) => this.tachesSignal.set(reponse.taches)));
  }

  chargerMesTaches() {
    return this.http
      .get<{ status: 'ok'; taches: MaTache[] }>(`${API_BASE_URL}/taches/mes-taches`)
      .pipe(tap((reponse) => this.mesTachesSignal.set(reponse.taches)));
  }

  creer(entree: CreerTacheEntree) {
    return this.http.post<{ status: 'ok'; id: number }>(`${API_BASE_URL}/taches`, entree);
  }

  modifier(id: number, entree: ModifierTacheEntree) {
    return this.http.patch<{ status: 'ok' }>(`${API_BASE_URL}/taches/${id}`, entree);
  }

  attribuer(id: number, utilisateurIds: number[]) {
    return this.http.post<{ status: 'ok' }>(`${API_BASE_URL}/taches/${id}/attribution`, {
      utilisateurIds,
    });
  }

  supprimer(id: number) {
    return this.http
      .delete<{ status: 'ok' }>(`${API_BASE_URL}/taches/${id}`)
      .pipe(tap(() => this.tachesSignal.update((liste) => liste.filter((t) => t.id !== id))));
  }

  modifierStatut(id: number, statut: StatutTache) {
    return this.http
      .patch<{ status: 'ok' }>(`${API_BASE_URL}/taches/${id}/statut`, { statut })
      .pipe(
        tap(() =>
          this.mesTachesSignal.update((liste) =>
            liste.map((t) => (t.id === id ? { ...t, statut } : t))
          )
        )
      );
  }
}
