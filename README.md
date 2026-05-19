# 3D Cube

An interactive 3D cube experience built with **Next.js** and deployed on **Netlify**.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Netlify](https://netlify.com/) — hosting & CI/CD

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view locally.

## Deploy to Netlify

This project is pre-configured for Netlify via `netlify.toml`.

1. Push this repo to GitHub.
2. In Netlify → **Add new site** → **Import an existing project** → connect your GitHub repo.
3. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. Click **Deploy site** — done!

The `@netlify/plugin-nextjs` plugin is bundled automatically by Netlify and handles SSR/ISR/image optimisation for Next.js.
