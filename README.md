# MindMate AI

MindMate AI is a full-stack AI therapy platform that provides personalized mental health support through intelligent conversations and evidence-based therapeutic techniques.

## Features

- 24/7 AI-powered therapy sessions
- Personalized therapeutic approaches
- Secure and private conversations
- Activity tracking and mood monitoring
- Evidence-based interventions

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
















ALL MY NOTES:
App folder (routes and layouts live here)
Lib folder (put utilities functions or shared logic)
Public folder (store static assets, images, icons, or anything you want to serve directly)
components folder (store all reusable parts of our UI)
packages.json (track of all dependencies and scripts for the project)
tsconfig.json configures typescript for your project
next.config.json handles custom nextjs configs

backend: package.json is the manifest for your NodeJS project (it contains metadata for your project, and contains all of its dependencies). the recipe book for the app