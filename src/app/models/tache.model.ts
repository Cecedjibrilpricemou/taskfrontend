export type StatutTache = 'a_faire' | 'en_cours' | 'terminee';
export type PrioriteTache = 'basse' | 'moyenne' | 'haute';

interface TacheBase {
  id: number;
  titre: string;
  description: string | null;
  statut: StatutTache;
  priorite: PrioriteTache;
  date_creation: string;
  date_echeance: string | null;
  date_terminee: string | null;
}

/** Forme renvoyée par GET /api/taches (admin, v_taches_liste). */
export interface TacheListe extends TacheBase {
  cree_par: number;
  cree_par_nom: string;
  nb_assignes: number;
  utilisateurs_assignes_ids: string | null;
  utilisateurs_assignes_noms: string | null;
}

/** Forme renvoyée par GET /api/taches/mes-taches (sp_lister_taches_utilisateur, sans les champs d'attribution). */
export type MaTache = TacheBase;

export interface CreerTacheEntree {
  titre: string;
  description?: string;
  priorite: PrioriteTache;
  dateEcheance?: string;
}

export type ModifierTacheEntree = CreerTacheEntree;
