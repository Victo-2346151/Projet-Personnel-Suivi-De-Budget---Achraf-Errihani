import { formaterDate, formaterMontant } from '../utils/formatage';
import { IconeCorbeille, IconeCrayon, IconeRecu } from './Icones';
import type { IDette } from '../types';

interface IPropsListeDettes {
  dettes: IDette[];
  auClicModifier: (dette: IDette) => void;
  auClicSupprimer: (dette: IDette) => void;
  auClicBasculerStatut: (dette: IDette) => void;
  auClicNouvelle: () => void;
}

/**
 * Affiche la liste des dettes de l'utilisateur, avec un bouton pour
 * basculer le statut (Réglée/Non réglée) et des boutons pour modifier
 * ou supprimer. Les dettes réglées sont affichées grisées et barrées.
 */
function ListeDettes({
  dettes,
  auClicModifier,
  auClicSupprimer,
  auClicBasculerStatut,
  auClicNouvelle,
}: IPropsListeDettes): JSX.Element {
  if (dettes.length === 0) {
    return (
      <div className="carte carte-ombre-legere etat-vide">
        <IconeRecu />
        <span className="carte-titre">Aucune dette</span>
        <p className="carte-texte">Ajoutez une dette pour suivre l&apos;argent prêté ou emprunté.</p>
        <button type="button" className="bouton bouton-primaire" onClick={auClicNouvelle}>
          Ajouter une dette
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {dettes.map((dette) => {
        const estReglee = dette.statut === 'Réglée';

        return (
          <div
            key={dette.id}
            className="carte carte-ombre-legere"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: estReglee ? 0.55 : 1,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                className="carte-titre"
                style={{ textDecoration: estReglee ? 'line-through' : 'none' }}
              >
                {dette.personne}
              </span>
              <span
                className={`etiquette ${
                  dette.direction === 'on_me_doit' ? 'etiquette-accent' : 'etiquette-neutre'
                }`}
              >
                {dette.direction === 'je_dois' ? 'Je dois' : 'On me doit'}
              </span>
              <span
                className="carte-meta"
                style={{
                  color:
                    dette.direction === 'je_dois'
                      ? 'var(--couleur-solde-negatif)'
                      : 'var(--couleur-solde-positif)',
                }}
              >
                {formaterMontant(dette.montant)}
              </span>
              {dette.description !== null && <span className="carte-meta">{dette.description}</span>}
              <span className="carte-meta">{formaterDate(dette.dateCreation)}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                type="button"
                className="bouton bouton-secondaire"
                onClick={() => auClicBasculerStatut(dette)}
              >
                {estReglee ? 'Non réglée' : 'Marquer réglée'}
              </button>
              <button
                type="button"
                className="bouton bouton-icone bouton-fantome"
                onClick={() => auClicModifier(dette)}
                aria-label="Modifier"
              >
                <IconeCrayon />
              </button>
              <button
                type="button"
                className="bouton bouton-icone bouton-fantome"
                onClick={() => {
                  if (window.confirm(`Supprimer la dette de ${dette.personne} ?`)) {
                    auClicSupprimer(dette);
                  }
                }}
                aria-label="Supprimer"
              >
                <IconeCorbeille />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ListeDettes;
