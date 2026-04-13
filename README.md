# Raffle System Frontend (Angular)

## Description

A modern, responsive Single Page Application (SPA) built with Angular for managing and participating in Chinese Auctions. The frontend provides a polished user experience for browsing auctions, managing gifts, placing orders, and handling admin workflows.

## Core Tech Stack

- Angular 18+ (project is currently based on Angular 21)
- TypeScript
- RxJS
- SCSS

## Professional Features

- **Lazy Loading**: Route-based code splitting for major features including admin pages, cart, and order history.
- **Global Interceptors**: Centralized HTTP handling for:
  - Auth token injection
  - loading states
  - HTTP error handling
- **State Management**: Reactive data flow using RxJS Observables.
- **Security**: Route protection via `AuthGuard` and `AdminGuard`.
- **User Interface**:
  - Dark/light mode support
  - Toast notification system for user feedback

## Project Highlights

- Clean, component-based architecture
- Standalone component usage for shared UI pieces like toast and loading overlay
- Modular route configuration with lazy-loaded feature entry points
- Global services for notifications, loading state, authentication, and error handling

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd angolar
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open the app in your browser:

```text
http://localhost:4200
```

## Available Scripts

- `npm start` — runs `ng serve` and starts the local dev server
- `npm run build` — builds the application for production
- `npm test` — runs unit tests

## Notes

- The repository uses standalone components and the Angular `provideHttpClient`/`withInterceptors` integration.
- Global loading and error handling are applied through HTTP interceptors.
- Route-level guards enforce authentication and admin access.

## Recommended Workflow

- Use the existing component structure for fast feature development.
- Keep shared behavior in services and interceptors to avoid duplication.
- Favor lazy-loaded routes for large admin and user pages.

---

Built for a fast, secure, and maintainable raffle auction frontend experience.
