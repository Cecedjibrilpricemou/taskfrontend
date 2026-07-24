export type Role = 'admin' | 'utilisateur';
export type StatutUtilisateur = 'actif' | 'bloque' | 'desactive';

/** Forme renvoyée par /api/auth/login et /api/auth/me (utilisateur courant, sans dates). */
export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  statut: StatutUtilisateur;
}

/** Forme renvoyée par GET /api/utilisateurs (v_utilisateurs, avec dates). */
export interface UtilisateurListe extends Utilisateur {
  date_creation: string;
  derniere_connexion: string | null;
}
