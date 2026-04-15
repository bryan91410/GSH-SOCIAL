# GSH Social

GSH Social est une application web de reseau social developpee avec Vue 3. Elle permet a un utilisateur de creer un compte, se connecter, publier du contenu, liker, commenter et echanger avec d'autres utilisateurs via une messagerie privee.

Ce projet a ete realise dans un contexte de BTS SIO et peut etre presente comme une application complete utilisant un frontend moderne, une gestion d'etat centralisee et une base de donnees securisee avec Supabase.

## Objectifs Du Projet

L'objectif principal est de proposer une plateforme sociale simple et securisee avec les fonctionnalites suivantes :

- inscription et connexion utilisateur ;
- protection des pages privees ;
- affichage d'un fil d'actualite ;
- creation de publications avec texte et/ou image ;
- systeme de likes ;
- systeme de commentaires ;
- affichage du profil utilisateur ;
- messagerie privee entre utilisateurs ;
- reception des messages en temps reel ;
- gestion des erreurs avec notifications.

## Technologies Utilisees

### Frontend

- Vue 3
- Vite
- Pinia
- Vue Router
- Tailwind CSS

### Backend Et Base De Donnees

- Supabase Auth
- Supabase Database
- Supabase Realtime
- PostgreSQL
- Row Level Security

### Autres Outils

- Node.js
- npm
- Netlify pour le deploiement frontend

## Structure Du Projet

```txt
gsh-social/
├── public/
│   ├── _redirects
│   └── favicon.ico
├── server/
│   ├── data/
│   ├── middleware/
│   ├── routes/
│   └── index.js
├── src/
│   ├── assets/
│   │   └── main.css
│   ├── components/
│   │   ├── BarreNavigation.vue
│   │   ├── FormulaireAuthGlitch.vue
│   │   ├── GabaritPage.vue
│   │   └── ToastCenter.vue
│   ├── lib/
│   │   └── supabase.js
│   ├── router/
│   │   └── index.js
│   ├── services/
│   │   └── api.js
│   ├── stores/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── post.js
│   │   └── toast.js
│   ├── views/
│   │   ├── Connexion.vue
│   │   ├── Conversations.vue
│   │   ├── Fil.vue
│   │   ├── Inscription.vue
│   │   ├── MotDePasseOublie.vue
│   │   ├── Profil.vue
│   │   └── ReinitialiserMotDePasse.vue
│   ├── App.vue
│   └── main.js
├── supabase/
│   └── schema.sql
├── index.html
├── netlify.toml
├── package.json
└── vite.config.js
```

## Installation

Installer les dependances du projet :

```sh
npm install
```

Lancer le serveur de developpement :

```sh
npm run dev
```

Construire l'application pour la production :

```sh
npm run build
```

Previsualiser la version de production :

```sh
npm run preview
```

## Variables D'environnement

Le projet utilise Supabase. Il faut creer un fichier `.env` a la racine du projet avec les variables suivantes :

```env
VITE_SUPABASE_URL=URL_DU_PROJET_SUPABASE
VITE_SUPABASE_ANON_KEY=CLE_ANON_SUPABASE
```

Ces variables sont lues dans le fichier `src/lib/supabase.js`.

Si elles ne sont pas renseignees, l'application affiche un message d'erreur indiquant que la configuration Supabase est manquante.

## Base De Donnees Supabase

Le fichier `supabase/schema.sql` contient le script SQL permettant de creer toute la base de donnees.

Il cree les tables suivantes :

- `profiles` : informations publiques des utilisateurs ;
- `posts` : publications du fil d'actualite ;
- `post_likes` : likes des publications ;
- `comments` : commentaires des publications ;
- `conversations` : conversations privees ;
- `conversation_participants` : utilisateurs participant aux conversations ;
- `messages` : messages envoyes dans les conversations.

Le script cree egalement :

- des contraintes de securite ;
- des index de performance ;
- des triggers ;
- des policies RLS ;
- une fonction permettant de verifier si un utilisateur est membre d'une conversation.

## Securite

La securite est geree a plusieurs niveaux.

### Authentification

L'authentification est geree par Supabase Auth. L'utilisateur peut :

- creer un compte ;
- se connecter ;
- se deconnecter ;
- demander une reinitialisation de mot de passe ;
- definir un nouveau mot de passe.

### Routes Protegees

Les routes privees sont protegees dans `src/main.js` avec une garde de navigation Vue Router.

Les pages suivantes necessitent une connexion :

- `/fil`
- `/profil`
- `/conversations`

Si un utilisateur non connecte tente d'acceder a une page protegee, il est redirige vers `/connexion`.

### Row Level Security

La base Supabase utilise les RLS, c'est-a-dire des regles de securite appliquees directement au niveau de la base de donnees.

Exemples :

- un utilisateur ne peut supprimer que ses propres posts ;
- un utilisateur ne peut supprimer que ses propres commentaires ;
- un utilisateur ne peut envoyer un message que dans une conversation dont il est membre ;
- un utilisateur ne peut lire une conversation que s'il y participe.

## Fonctionnement General

L'architecture suit ce parcours :

```txt
Page Vue -> Store Pinia -> Service API -> Supabase -> Base PostgreSQL
```

Exemple pour la creation d'un post :

1. L'utilisateur remplit le formulaire dans `Fil.vue`.
2. La fonction `submitPost()` est executee.
3. Elle appelle `postStore.createPost()`.
4. Le store appelle `postsAPI.create()`.
5. `postsAPI.create()` insere le post dans Supabase.
6. Le nouveau post est ajoute au fil d'actualite.

## Fonctionnalites Principales

### Connexion Et Inscription

Les pages `Connexion.vue` et `Inscription.vue` utilisent le composant reutilisable `FormulaireAuthGlitch.vue`.

Ce composant recoit une liste de champs en props et renvoie les donnees du formulaire avec un evenement `submit`.

L'authentification est centralisee dans le store `auth.js`.

### Fil D'actualite

La page `Fil.vue` permet :

- d'afficher les publications ;
- de creer une publication ;
- d'ajouter une image ;
- de liker ou unliker ;
- d'afficher les commentaires ;
- d'ajouter un commentaire ;
- de supprimer ses propres publications ;
- de supprimer ses propres commentaires ;
- de charger plus de publications avec pagination.

Les donnees des posts sont gerees par le store `post.js`.

### Profil

La page `Profil.vue` affiche les informations de l'utilisateur connecte :

- nom ;
- email ;
- role.

Pour le moment, le profil est affiche en lecture seule.

### Messagerie Privee

La page `Conversations.vue` permet :

- de rechercher un utilisateur ;
- de creer ou ouvrir une conversation ;
- de lire les messages ;
- d'envoyer un message ;
- de recevoir les nouveaux messages en temps reel.

Le temps reel est gere avec Supabase Realtime dans le store `chat.js`.

## Stores Pinia

### `auth.js`

Ce store gere :

- l'utilisateur connecte ;
- le token de session ;
- la connexion ;
- l'inscription ;
- la deconnexion ;
- la recuperation de session ;
- la reinitialisation du mot de passe.

### `post.js`

Ce store gere :

- la liste des posts ;
- le chargement des posts ;
- la pagination ;
- la creation de posts ;
- la suppression de posts ;
- les likes ;
- les commentaires.

### `chat.js`

Ce store gere :

- la liste des utilisateurs ;
- les conversations ;
- les messages ;
- la conversation active ;
- l'envoi de messages ;
- l'abonnement temps reel.

### `toast.js`

Ce store gere les notifications affichees dans l'application :

- succes ;
- erreur ;
- information.

## API Supabase

Le fichier `src/services/api.js` contient les objets suivants :

- `authAPI`
- `postsAPI`
- `chatAPI`

Ces objets regroupent les fonctions qui communiquent avec Supabase.

Le fichier contient aussi des fonctions de normalisation comme :

- `normalizePost`
- `normalizeComment`
- `normalizeMessage`

Elles transforment les donnees venant de Supabase en objets plus simples a utiliser dans le frontend.

## Design

Le style de l'application est defini principalement dans `src/assets/main.css`.

L'interface utilise un theme sombre avec un style glitch/cyber :

- fond noir ;
- cyan neon ;
- violet ;
- police monospace ;
- cartes avec bordures lumineuses ;
- boutons animes ;
- labels avec effet glitch.

## Serveur Express Local

Le dossier `server` contient une API Express locale avec :

- authentification JWT ;
- routes de connexion et inscription ;
- routes de posts ;
- stockage dans un fichier JSON.

Cependant, dans la version actuelle de l'application, le frontend utilise Supabase via `src/services/api.js`.

Le serveur Express peut donc etre considere comme une ancienne version, une maquette locale ou une alternative de test.

## Deploiement

Le fichier `netlify.toml` configure le deploiement sur Netlify :

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Le fichier `public/_redirects` permet a Vue Router de fonctionner correctement en production :

```txt
/* /index.html 200
```

Cela evite les erreurs 404 quand l'utilisateur recharge directement une route comme `/profil` ou `/conversations`.

## Pistes D'amelioration

Plusieurs ameliorations peuvent etre envisagees :

- ajouter la modification du profil utilisateur ;
- stocker les images dans Supabase Storage ;
- ajouter des notifications pour les nouveaux messages ;
- ajouter une recherche de publications ;
- ajouter un systeme de roles administrateur ;
- ajouter des tests unitaires ;
- supprimer ou finaliser le serveur Express local ;
- ameliorer la moderation des contenus ;
- ajouter une page de detail pour chaque publication.

## Presentation Orale Possible

Pour presenter le projet, on peut resumer ainsi :

> GSH Social est une application web de reseau social developpee avec Vue 3. Elle permet aux utilisateurs de s'inscrire, se connecter, publier du contenu, liker, commenter et discuter en messagerie privee. Le frontend utilise Vue, Pinia et Vue Router. Les donnees, l'authentification et le temps reel sont geres par Supabase. La securite est renforcee par des policies RLS qui limitent les actions selon l'utilisateur connecte.

Le point important a retenir est le parcours des donnees :

```txt
Utilisateur -> Vue -> Pinia -> API -> Supabase -> Interface mise a jour
```

Cette organisation rend le projet plus clair, plus maintenable et plus simple a expliquer pendant l'epreuve.
