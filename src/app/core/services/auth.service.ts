import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { Utilisateur } from '../../models/utilisateur.model';

interface ConnexionReponse {
  status: 'ok';
  token: string;
  utilisateur: Utilisateur;
}

const CLE_TOKEN = 'tm_token';
const CLE_UTILISATEUR = 'tm_utilisateur';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly utilisateurSignal = signal<Utilisateur | null>(this.lireUtilisateurStocke());
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(CLE_TOKEN));

  readonly utilisateur = this.utilisateurSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly estConnecte = computed(() => this.utilisateurSignal() !== null);
  readonly isAdmin = computed(() => this.utilisateurSignal()?.role === 'admin');

  login(email: string, motDePasse: string): Observable<ConnexionReponse> {
    return this.http
      .post<ConnexionReponse>(`${API_BASE_URL}/auth/login`, { email, motDePasse })
      .pipe(
        tap((reponse) => {
          localStorage.setItem(CLE_TOKEN, reponse.token);
          localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(reponse.utilisateur));
          this.tokenSignal.set(reponse.token);
          this.utilisateurSignal.set(reponse.utilisateur);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(CLE_TOKEN);
    localStorage.removeItem(CLE_UTILISATEUR);
    this.tokenSignal.set(null);
    this.utilisateurSignal.set(null);
  }

  private lireUtilisateurStocke(): Utilisateur | null {
    const brut = localStorage.getItem(CLE_UTILISATEUR);
    if (!brut) return null;
    try {
      return JSON.parse(brut) as Utilisateur;
    } catch {
      return null;
    }
  }
}
