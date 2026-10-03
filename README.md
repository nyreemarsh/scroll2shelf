This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Run locally from a fresh clone

Requirements:

- Node.js 20.9 or newer (Node 22 LTS is recommended)
- npm, which is included with Node.js

Clone the repository, install the exact dependency versions from the lockfile,
and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

No environment variables, external APIs, remote fonts, Python setup, or
catalogue rebuild are required to run the checked-in app. The product data
lives in `src/data/` and the product images live in
`public/images/products/`; both directories must be included in commits pushed
to GitHub.

To verify a checkout before sharing it:

```bash
npm run lint
npm run build
npm start
```

`npm run build` first verifies that every catalogue image is bundled in the
repository, so an incomplete Git commit fails with an actionable message.

## Product cutouts for the virtual shelves

The 240 selected catalogue products use transparent, background-removed WebP
images committed in `public/images/products/`. A fresh clone uses these files
directly and does not need access to the source catalogue.

For maintainers rebuilding the catalogue, the source of truth is the flat folder at
`../data/mands/images_no_background/`; its CSV mapping is
`../data/mands/mands_image_background_removal.csv`.

Run the following after rebuilding the catalogue, or whenever the source
cutouts change:

```bash
npm run sync:cutouts
```

This validates every selected product and publishes the matching files to
`public/images/products/`. The app stores each image as
`/images/products/<source-image-id>.webp`, so every virtual-shelf surface
(product cards, basket and ranked shelf) uses the same local transparent asset.

## Dinner basket rules

The setup no longer exposes course presets, dietary requirements or allergy
filters. The simulator uses a fixed starter → main → dessert journey, with a
drink played at the observed participation rate. `src/lib/simulation/meal.ts`
checks whether a product can lead a course and adds food needed for two people:
something to eat with a dip, a different compatible main or substantial side
for a small main, and a different dessert when one portion is too small.
Additions appear in the basket and count towards the displayed price and
simulation results. A product is never paired with the same SKU again; basket
pairings and complete-basket summaries also de-duplicate product IDs as a
defensive safeguard.

These are transparent, name-based prototype rules. For a production-quality
selection, add reviewed product metadata for serving count, food role,
preparation status and compatible accompaniments; use that metadata to build
and score complete meal bundles.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
