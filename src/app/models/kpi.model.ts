import { StatutTache, PrioriteTache } from './tache.model';
import { StatutUtilisateur } from './utilisateur.model';

export interface KpiSynthese {
  total_taches: number;
  taches_terminees: number;
  taches_a_faire: number;
  taches_en_cours: number;
  taches_en_retard: number;
  utilisateurs_actifs: number;
  utilisateurs_bloques: number;
  utilisateurs_desactives: number;
}

export interface KpiParStatut {
  statut: StatutTache;
  total: number;
}

export interface KpiParPriorite {
  priorite: PrioriteTache;
  total: number;
}

export interface KpiTacheEnRetard {
  id: number;
  titre: string;
  date_echeance: string | null;
  priorite: PrioriteTache;
}

export interface KpiChargeUtilisateur {
  utilisateur_id: number;
  utilisateur_nom: string;
  statut_utilisateur: StatutUtilisateur;
  nb_taches_actives: number;
}

export interface KpisComplets {
  synthese: KpiSynthese;
  parStatut: KpiParStatut[];
  parPriorite: KpiParPriorite[];
  enRetard: KpiTacheEnRetard[];
  chargeUtilisateurs: KpiChargeUtilisateur[];
}
