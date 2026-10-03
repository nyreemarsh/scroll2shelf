import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cataloguePath = path.join(root, "src", "data", "products.json");
const products = JSON.parse(await readFile(cataloguePath, "utf8"));

if (!Array.isArray(products) || products.length === 0) {
  throw new Error("src/data/products.json must contain at least one product.");
}

const invalid = products.filter(
  (product) =>
    typeof product.image !== "string" ||
    !product.image.startsWith("/images/products/") ||
    !product.image.endsWith(".webp"),
);

if (invalid.length > 0) {
  throw new Error(
    `${invalid.length} product(s) do not reference a bundled WebP image; first: ${invalid[0].id ?? "unknown"}`,
  );
}

const imagePaths = [...new Set(products.map((product) => product.image))];
const missing = [];

for (const image of imagePaths) {
  const localPath = path.join(root, "public", image.replace(/^\//, ""));
  try {
    await access(localPath);
  } catch {
    missing.push(image);
  }
}

if (missing.length > 0) {
  throw new Error(
    `${missing.length} bundled product image(s) are missing; first: ${missing[0]}. Commit public/images/products/ before sharing the repository.`,
  );
}

console.log(
  `Verified ${products.length} products and ${imagePaths.length} bundled image assets.`,
);
