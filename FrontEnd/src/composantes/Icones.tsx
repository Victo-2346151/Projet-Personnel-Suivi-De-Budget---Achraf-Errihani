interface IPropsIcone {
  taille?: number;
}

/**
 * Icône portefeuille, utilisée comme logo de l'application.
 */
export function IconePortefeuille({ taille = 20 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="17" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Icône de tendance à la hausse, utilisée pour les revenus.
 */
export function IconeTendanceHausse({ taille = 14 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="3,17 9,11 13,15 21,6" />
      <polyline points="15,6 21,6 21,12" />
    </svg>
  );
}

/**
 * Icône de tendance à la baisse, utilisée pour les dépenses.
 */
export function IconeTendanceBaisse({ taille = 14 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="3,7 9,13 13,9 21,18" />
      <polyline points="15,18 21,18 21,12" />
    </svg>
  );
}

/**
 * Icône "plus", utilisée pour les boutons d'ajout.
 */
export function IconePlus({ taille = 14 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

/**
 * Icône crayon, utilisée pour les boutons de modification.
 */
export function IconeCrayon({ taille = 15 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" />
    </svg>
  );
}

/**
 * Icône corbeille, utilisée pour les boutons de suppression.
 */
export function IconeCorbeille({ taille = 15 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
    </svg>
  );
}

/**
 * Icône de graphique en barres, utilisée pour la répartition des dépenses.
 */
export function IconeGraphique({ taille = 12 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="20" x2="20" y2="20" />
      <rect x="6" y="12" width="3" height="8" />
      <rect x="11" y="8" width="3" height="12" />
      <rect x="16" y="4" width="3" height="16" />
    </svg>
  );
}

/**
 * Icône utilisée pour l'état vide des catégories.
 */
export function IconeCategorieVide({ taille = 22 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 3H4v7l9 9 7-7-9-9z" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Icône de reçu, utilisée pour l'état vide des transactions.
 */
export function IconeRecu({ taille = 22 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}

/**
 * Icône de déconnexion.
 */
export function IconeDeconnexion({ taille = 16 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4" />
      <path d="M15 8l4 4-4 4" />
      <path d="M19 12H9" />
    </svg>
  );
}

/**
 * Icône soleil, utilisée pour basculer vers le mode clair.
 */
export function IconeSoleil({ taille = 16 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
      <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
      <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
    </svg>
  );
}

/**
 * Icône lune, utilisée pour basculer vers le mode sombre.
 */
export function IconeLune({ taille = 16 }: IPropsIcone): JSX.Element {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
    </svg>
  );
}
