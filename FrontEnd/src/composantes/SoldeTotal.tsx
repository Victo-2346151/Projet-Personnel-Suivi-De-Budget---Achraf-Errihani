interface IPropsSoldeTotal {
  solde: number;
}

/**
 * Affiche le solde total de l'utilisateur, en vert s'il est positif ou
 * nul, en rouge s'il est négatif.
 */
function SoldeTotal({ solde }: IPropsSoldeTotal): JSX.Element {
  const couleur = solde >= 0 ? 'green' : 'red';

  return (
    <div>
      <h2>Solde total</h2>
      <p style={{ color: couleur, fontWeight: 'bold' }}>{solde.toFixed(2)} $</p>
    </div>
  );
}

export default SoldeTotal;
