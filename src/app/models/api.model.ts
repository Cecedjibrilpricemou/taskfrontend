/** Enveloppe d'erreur commune à toutes les réponses non-2xx de l'API. */
export interface ErreurApi {
  status: 'erreur';
  message: string;
}
