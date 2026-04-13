# GSH-Social

Application Vue 3 + Pinia.

## Setup

```sh
npm install
```

## Variables d environnement

Crée un `.env` à la racine (ou copie `.env.example`) puis renseigne :

```sh
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Base Supabase

Exécute le SQL de [`supabase/schema.sql`](./supabase/schema.sql) dans l éditeur SQL Supabase pour créer :
- `profiles`
- `posts`
- `post_likes`
- `comments`
- `conversations`
- `conversation_participants`
- `messages`
- les policies RLS
- le trigger de création de profil
- les index et contraintes de sécurité

## Dev

```sh
npm run dev
```

## Build

```sh
npm run build
```
