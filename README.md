<div align="center">

# 🍿 WatchMate — Frontend

**Your watch history, watchlists, and the next episode — all in one place.**

A responsive React application for discovering, tracking, and discussing movies and TV shows.

[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)

**[🌐 Live App](https://www.mywatchmate.us)** · **[⚙️ Backend Repository](https://github.com/MuhammadYassa/WatchMate)** · **[👤 Author](https://github.com/MuhammadYassa)**

</div>

---

## What is WatchMate?

You know the show. You just can't remember where you stopped watching.

**WatchMate** helps you track movies and TV shows, manage watchlists, find new titles, and pick up where you left off. This repository contains the **React/TypeScript frontend** for a full-stack application I built and deployed independently. Its Spring Boot API is maintained in a [separate backend repository](https://github.com/MuhammadYassa/WatchMate).

Over a two-month milestone, WatchMate reached **100 users**, with **4,298 episodes tracked**. An earlier three-week beta involved 10 users and 1,148 episode watches.

## What you can do

| Feature | User experience |
| --- | --- |
| **Discover** | Browse trending, popular, and upcoming movies and TV shows |
| **Search** | Look up titles and explore movie/show detail pages |
| **Track progress** | Update movie statuses and follow episode progress across seasons |
| **Save favourites** | Keep a personal collection of favourite movies and shows |
| **Build watchlists** | Organize titles you plan to watch |
| **Review titles** | View and interact with movie and TV reviews |
| **Your dashboard** | See continue-watching, upcoming episodes, and calendar information |
| **Social features** | Explore profiles, find people, and manage follow requests |
| **Accounts** | Register, verify email, sign in, and access protected pages |

> Product adoption figures describe the full WatchMate application, not the frontend repository alone.

---

## Frontend engineering

### Tech stack

| Layer | Tools |
| --- | --- |
| **UI** | React 19, TypeScript, Tailwind CSS 4, Lucide icons |
| **Build** | Vite 8 |
| **Routing** | React Router 7 |
| **Server state** | TanStack Query 5 |
| **Session state** | Zustand 5 |
| **Testing** | Vitest, React Testing Library, jsdom |
| **Quality** | TypeScript type checks, ESLint |
| **Deployment** | Vercel configuration for client-side routing |

### Architecture at a glance

```text
                  React UI
                     |
               React Router
             /              \
     Public pages        Protected pages
       (browse,          (dashboard,
       search,           watchlists,
       details)          profile, social)
             \              /
              v            v
             Pages + components
                     |
          +----------+---------+
          |                    |
          v                    v
     TanStack Query        Zustand auth store
     (server data)        (session state)
          |                    |
          +----------+---------+
                     |
            Shared API client
                     |
              Spring Boot API
                     |
            MySQL / Redis / TMDB
```

The frontend is organized around a small application shell with separate routes, pages, components, API integration, and authentication logic.

### Decisions that shaped the frontend

**Route-level code splitting.** Main pages use `React.lazy`, so page modules can load on navigation rather than all being bundled into the initial page. The app shell stays visible while a page loads.

**Server state vs. session state.** TanStack Query handles API-backed data, caching, and retries. Zustand manages authentication/session state. This keeps server data separate from client-side session concerns.

**A shared API client.** Requests go through a wrapper that attaches access tokens, normalizes API errors, and handles token refresh. On a `401`, the client can refresh the session and retry the original request once; simultaneous refresh attempts share the same in-flight promise.

**Protected navigation.** Routes such as `/dashboard`, `/watchlists`, and `/favourites` require a session. Unauthenticated users are directed to login, with a return path to the requested page.

---

## Getting started

### Requirements

- Node.js and npm compatible with this repository's **Vite 8** toolchain
- A running [WatchMate backend](https://github.com/MuhammadYassa/WatchMate) for API-backed features

### 1. Clone and install

```bash
git clone https://github.com/MuhammadYassa/WatchMate_Frontend.git
cd WatchMate_Frontend
npm ci
```

### 2. Configure the API URL

Create a `.env.local` file in the frontend root:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

The API client uses `VITE_API_BASE_URL`, with `http://localhost:8080/api/v1` as its code fallback. The repository currently also contains a production URL in `.env`, so **`.env.local` is recommended for local development** to override it.

Vite exposes `VITE_` variables to browser-side code. **Never put private credentials or API secrets in these variables.**

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite (normally **`http://localhost:5173`**).

### 4. Start the backend (separate repository)

The [backend repository](https://github.com/MuhammadYassa/WatchMate) includes a development Compose stack that launches the Spring Boot API, MySQL, and Redis:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Run this command **from the backend repository**, after configuring its environment variables. The local API is available at `http://localhost:8080`.

---

## Scripts

These commands come from the repository's `package.json`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project build and produce a production bundle |
| `npm run preview` | Preview the built app locally |
| `npm run test` | Run Vitest tests once |
| `npm run typecheck` | Type-check app and Node/Vite configuration |
| `npm run lint` | Run ESLint with zero warnings allowed |

For a quick local quality check:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Project layout

```text
src/
├── app/
│   ├── providers/       # App-level providers
│   ├── router/          # Route definitions and lazy page imports
│   └── queryClient.ts   # Shared TanStack Query defaults
├── api/                 # Typed HTTP client and API integration
├── auth/                # Authentication state and route guards
├── components/          # Reusable UI and application layout
├── pages/               # Screens: browse, details, dashboard, etc.
├── test/                # Shared test setup
├── App.tsx
└── main.tsx
```

The project configures Vitest with a `jsdom` environment and React Testing Library for UI tests.

## Deployment

The project has a [`vercel.json`](./vercel.json) rewrite that directs client-side URLs to `index.html`, allowing deep links such as `/shows/:tmdbId` to work when opened directly.

For a production build:

```bash
npm run build
```

Configure `VITE_API_BASE_URL` in the deployment environment to point at the deployed backend's `/api/v1` base path.

---

## Connected repositories

| Repository | Role |
| --- | --- |
| **[WatchMate_Frontend](https://github.com/MuhammadYassa/WatchMate_Frontend)** | React application, navigation, UI state, and API integration |
| **[WatchMate](https://github.com/MuhammadYassa/WatchMate)** | Spring Boot REST API, authentication, persistence, caching, and background processing |

**[🌐 Try WatchMate](https://www.mywatchmate.us)** · **[💼 LinkedIn](https://www.linkedin.com/in/muhammadyassa/)** · **[👨‍💻 GitHub](https://github.com/MuhammadYassa)**

<sub>Built by Muhammad Yassa. Media metadata is integrated from TMDB; WatchMate is an independent project.</sub>
