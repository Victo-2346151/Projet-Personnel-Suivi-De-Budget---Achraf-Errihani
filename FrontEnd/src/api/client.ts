const URL_BASE_API = 'http://localhost:3000/api';

/**
 * Effectue un appel GET vers l'API backend et retourne les données JSON
 * de la réponse, typées selon le type générique fourni par l'appelant.
 * Inclut le cookie de session (credentials: 'include').
 */
export async function appelApi<T>(cheminRelatif: string): Promise<T> {
  const reponse = await fetch(`${URL_BASE_API}${cheminRelatif}`, {
    credentials: 'include',
  });

  if (!reponse.ok) {
    throw new Error(`Erreur API: ${reponse.status}`);
  }

  return reponse.json() as Promise<T>;
}

/**
 * Effectue un appel POST vers l'API backend avec un corps JSON optionnel
 * et retourne les données JSON de la réponse. Inclut le cookie de
 * session (credentials: 'include') pour que l'authentification fonctionne.
 */
export async function appelApiPost<T>(cheminRelatif: string, corps?: unknown): Promise<T> {
  const reponse = await fetch(`${URL_BASE_API}${cheminRelatif}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });

  if (!reponse.ok) {
    const donneesErreur = (await reponse.json()) as { message?: string };
    throw new Error(donneesErreur.message ?? `Erreur API: ${reponse.status}`);
  }

  if (reponse.status === 204) {
    return undefined as T;
  }

  return reponse.json() as Promise<T>;
}
