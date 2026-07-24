import { PrioriteTache, StatutTache } from '../models/tache.model';
import { StatutUtilisateur } from '../models/utilisateur.model';

const LIBELLE_PRIORITE: Record<PrioriteTache, string> = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
};

const CLASSE_PRIORITE: Record<PrioriteTache, string> = {
  basse: 'badge badge--vert',
  moyenne: 'badge badge--orange',
  haute: 'badge badge--rouge',
};

const LIBELLE_STATUT_TACHE: Record<StatutTache, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  terminee: 'Terminée',
};

const CLASSE_STATUT_TACHE: Record<StatutTache, string> = {
  a_faire: 'badge badge--gris',
  en_cours: 'badge badge--bleu',
  terminee: 'badge badge--vert',
};

const LIBELLE_STATUT_UTILISATEUR: Record<StatutUtilisateur, string> = {
  actif: 'Actif',
  bloque: 'Bloqué',
  desactive: 'Désactivé',
};

const CLASSE_STATUT_UTILISATEUR: Record<StatutUtilisateur, string> = {
  actif: 'badge badge--vert',
  bloque: 'badge badge--rouge',
  desactive: 'badge badge--gris',
};

export function libellePriorite(priorite: PrioriteTache): string {
  return LIBELLE_PRIORITE[priorite];
}

export function classePriorite(priorite: PrioriteTache): string {
  return CLASSE_PRIORITE[priorite];
}

export function libelleStatutTache(statut: StatutTache): string {
  return LIBELLE_STATUT_TACHE[statut];
}

export function classeStatutTache(statut: StatutTache): string {
  return CLASSE_STATUT_TACHE[statut];
}

export function libelleStatutUtilisateur(statut: StatutUtilisateur): string {
  return LIBELLE_STATUT_UTILISATEUR[statut];
}

export function classeStatutUtilisateur(statut: StatutUtilisateur): string {
  return CLASSE_STATUT_UTILISATEUR[statut];
}
