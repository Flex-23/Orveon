# Orveon

Orveon is the platform I built for a small software studio. It is the public website and the behind-the-scenes admin tool in one codebase, so the same project runs the marketing pages people see and the dashboard the team uses to keep everything current.

I wanted it to feel fast and intentional instead of a generic template, so the whole front end is in Arabic with a right-to-left layout and a fair bit of motion work.

## What it does

The public side has the pages you'd expect from a studio: an about section, the services, and a small store where visitors can browse products, add things to a cart, and either check out or reserve an item. There's also a "start a project" flow for people who want custom work, and most of the contact and order handoff goes through WhatsApp.

On the account side, visitors can register, sign in, and manage their profile. Members get a private area where they can download the programs and files tied to their account. Those files are served through a protected route rather than sitting in a public folder, so they aren't just open links.

The dashboard is where the team actually runs things. From there you can:

- edit site content like services, works, and the trial pages
- manage members, admins, and member dues
- keep track of projects
- run the store: categories, products, orders, and reservations

## Tech

It's a Next.js app on the App Router, written in TypeScript with React. Styling is Tailwind, and framer-motion handles the animations. Data lives in a database through Prisma, auth uses signed JWT sessions (jose) with bcrypt for password hashing, and form validation goes through zod.

## Running it locally

You'll need Node and a database. Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

Then install, set up the database, and start the dev server:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

The app comes up on http://localhost:3000. There's also a seed script (`npm run db:seed`) if you want some starting data to work with.
