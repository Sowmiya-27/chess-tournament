# Chess Tournament Management System

A single-page web app for managing chess players and running random single-elimination
tournaments, built with Svelte + Vite. Data persists in the browser via localStorage.

## Features
- Player CRUD
- Tournament CRUD, with adding/removing players
- Random match system: random pairing, random winner per match, results recorded
- Final rankings: 1st, 2nd, and 3rd place (with a 3rd-place playoff match)

## Run locally
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build for production
\`\`\`bash
npm run build
npm run preview
\`\`\`

## Tech stack
Svelte, JavaScript, Vite, localStorage (client-side persistence)