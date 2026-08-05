# Projet-Personnel-Suivi-De-Budget---Achraf-Errihani

# Suivi de Budget

Une application web pour suivre son budget personnel : revenus, dépenses,
catégories, budgets limites et même les petites dettes entre amis. Le tout
avec des graphiques pour voir où va l'argent chaque mois.

Projet de fin de session, DEC Techniques de l'informatique — Cégep de
Victoriaville.

## Ce que l'application permet de faire

- **S'inscrire et se connecter**, avec une session qui reste active tant
  qu'on ne se déconnecte pas.
- **Créer des catégories** (revenu ou dépense), avec un budget limite
  optionnel. Une fois que des transactions sont liées à une catégorie, son
  type ne peut plus changer, question de ne pas mélanger l'historique.
- **Ajouter, modifier et supprimer des transactions**, filtrables par
  catégorie, par type ou par plage de dates. La liste peut aussi s'exporter
  en CSV.
- **Voir son solde en un coup d'œil** : total, revenus, dépenses, et le
  portrait du mois en cours.
- **Recevoir une alerte visuelle** quand une catégorie approche ou dépasse
  son budget limite (vert, orange, rouge selon le pourcentage utilisé).
- **Visualiser ses finances** avec deux graphiques faits maison (pas de
  librairie externe) : répartition des dépenses par catégorie, et évolution
  des revenus/dépenses sur les 6 derniers mois.
- **Garder une trace des dettes personnelles** : ce qu'on doit à quelqu'un,
  ou ce que quelqu'un nous doit, avec un statut réglé/non réglé.
- **Basculer entre thème clair et sombre**, avec le choix qui reste mémorisé.

## Avec quoi c'est construit

**Backend**

- Node.js + Express, en TypeScript
- MySQL comme base de données (via Docker), avec `mysql2` pour s'y connecter
- Sessions gérées avec `express-session`, mots de passe hachés avec `bcrypt`

**Frontend**

- React + TypeScript, avec Vite
- Les graphiques sont codés à la main en SVG/CSS, sans librairie externe

**Qualité**

- ESLint configuré sur les deux projets
- 91 cas de test documentés manuellement (chemins valides, erreurs, isolation
  entre utilisateurs)

## Comment le lancer chez soi

### Ce qu'il faut avant de commencer

- Node.js (idéalement v18 ou plus récent)
- Docker (pour lancer MySQL rapidement — sinon une installation MySQL 8
  locale fonctionne aussi)
- npm

### Étapes

**1. Cloner le projet**

```bash
git clone https://github.com/Victo-2346151/Projet-Personnel-Suivi-De-Budget---Achraf-Errihani.git
cd Projet-Personnel-Suivi-De-Budget---Achraf-Errihani
```

**2. Démarrer MySQL** (avec Docker, par exemple)

```bash
docker run --name mysql-suivi-budget -e MYSQL_ROOT_PASSWORD=<ton_mot_de_passe> -p 3306:3306 -d mysql:8.0
```

**3. Créer la base de données et ses tables**

```bash
docker exec -i mysql-suivi-budget mysql -uroot -p<ton_mot_de_passe> < Dev/SuiviBudget_BaseDonnees.sql
```

**4. Lancer le backend**

```bash
cd BackEnd
npm install
cp .env.example .env   # puis remplir les valeurs, voir plus bas
npm run dev             # disponible sur http://localhost:3000
```

**5. Lancer le frontend** (dans un nouveau terminal)

```bash
cd FrontEnd
npm install
npm run dev             # disponible sur http://localhost:5173
```

### Variables d'environnement (`BackEnd/.env`)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<mot de passe MySQL>
DB_NAME=suiviBudget
SESSION_SECRET=<une chaîne aléatoire secrète>
FRONTEND_URL=http://localhost:5173
```

## Comment le projet est organisé

```
SuiviDeBudget/
├── BackEnd/                        API Express/TypeScript
│   └── src/
│       ├── config/bd.ts            connexion à MySQL
│       ├── middlewares/estConnecte.ts   protège les routes privées
│       ├── routes/                 authentification, catégories, transactions, dettes
│       ├── types/                  interfaces partagées
│       └── server.ts
├── FrontEnd/                       Application React/Vite
│   └── src/
│       ├── api/                    appels vers le backend
│       ├── composantes/            composants réutilisables
│       ├── pages/                  PageAuthentification, PageTableauDeBord
│       ├── utils/                  formatage, export CSV
│       └── theme.css               thème clair/sombre
└── Dev/
    ├── SuiviBudget_BaseDonnees.sql schéma de la base de données
    └── tests-livrable-1.xlsx       suivi des tests manuels
```

## La base de données

4 tables, toutes reliées à `utilisateurs` par clé étrangère : `utilisateurs`,
`categories`, `transactions`, `dettes`. Le détail complet se trouve dans
`Dev/SuiviBudget_BaseDonnees.sql`.

## Scripts disponibles

| Commande          | BackEnd                                | FrontEnd                    |
| ----------------- | -------------------------------------- | --------------------------- |
| `npm run dev`     | démarre le serveur (rechargement auto) | démarre Vite                |
| `npm run build`   | compile le TypeScript                  | build de production         |
| `npm run lint`    | vérifie le code avec ESLint            | vérifie le code avec ESLint |
| `npm run start`   | lance le build déjà compilé            | —                           |
| `npm run preview` | —                                      | prévisualise le build       |

## Aperçu des routes de l'API

```
POST   /api/inscription
POST   /api/connexion
POST   /api/deconnexion
GET    /api/moi

GET    /api/categories
GET    /api/categories/budgets
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

GET    /api/transactions            (filtres : categorieId, dateDebut, dateFin, type)
GET    /api/transactions/solde
GET    /api/transactions/resumeMois
GET    /api/transactions/parMois
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id

GET    /api/dettes
GET    /api/dettes/resume
POST   /api/dettes
PUT    /api/dettes/:id
PUT    /api/dettes/:id/statut
DELETE /api/dettes/:id
```

Toutes les routes, sauf l'inscription et la connexion, demandent une session
active.

## Tests

Le suivi des tests manuels se trouve dans `Dev/tests-livrable-1.xlsx` — 91 cas
couverts, incluant les chemins valides, les erreurs attendues (400/401/404),
et la vérification que chaque utilisateur ne voit que ses propres données.

## Auteur

Achraf Errihani — projet de fin de session, Techniques de l'informatique,
Cégep de Victoriaville.
