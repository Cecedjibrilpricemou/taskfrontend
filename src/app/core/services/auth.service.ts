import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { Utilisateur } from '../../models/utilisateur.model';

interface ConnexionReponse {
  status: 'ok';
  utilisateur: Utilisateur;
}

interface MeReponse {
  status: 'ok';
  utilisateur: Utilisateur;
}

// Le token vit désormais uniquement dans un cookie httpOnly posé par le
// serveur -- invisible et non manipulable en JavaScript. Ce service ne
// stocke donc plus rien lui-même : l'identité de l'utilisateur courant
// vient uniquement de la réponse de /auth/login ou /auth/me.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly utilisateurSignal = signal<Utilisateur | null>(null);

  readonly utilisateur = this.utilisateurSignal.asReadonly();
  readonly estConnecte = computed(() => this.utilisateurSignal() !== null);
  readonly isAdmin = computed(() => this.utilisateurSignal()?.role === 'admin');

  login(email: string, motDePasse: string): Observable<ConnexionReponse> {
    return this.http
      .post<ConnexionReponse>(`${API_BASE_URL}/auth/login`, { email, motDePasse })
      .pipe(tap((reponse) => this.utilisateurSignal.set(reponse.utilisateur)));
  }

  // Appelé une seule fois au démarrage de l'app (voir provideAppInitializer
  // dans app.config.ts), avant toute exécution de guard : c'est le seul
  // moyen de savoir qui est connecté puisque le cookie de session est
  // invisible en JavaScript. 401 == pas connecté, traité comme un cas
  // normal (pas une erreur) pour ne pas bloquer le démarrage de l'app.
  chargerUtilisateurCourant(): Observable<Utilisateur | null> {
    return this.http.get<MeReponse>(`${API_BASE_URL}/auth/me`).pipe(
      map((reponse) => reponse.utilisateur),
      tap((utilisateur) => this.utilisateurSignal.set(utilisateur)),
      catchError(() => {
        this.utilisateurSignal.set(null);
        return of(null);
      })
    );
  }

  logout(): Observable<unknown> {
    return this.http
      .post(`${API_BASE_URL}/auth/logout`, {})
      .pipe(tap(() => this.utilisateurSignal.set(null)));
  }

  // Utilisé par l'intercepteur quand une requête échoue en 401 : la session
  // est déjà invalide côté serveur (token expiré/absent), donc appeler
  // /auth/logout échouerait aussi en 401 -- on se contente de réaligner
  // l'état local sans requête réseau, pour éviter une boucle.
  reinitialiserSessionExpiree(): void {
    this.utilisateurSignal.set(null);
  }
}
