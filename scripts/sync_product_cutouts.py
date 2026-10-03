"""Publish the selected catalogue's transparent product cutouts for Next.js.

The full, authoritative cutout set is kept outside the app at
`../data/mands/images_no_background/`. This script selects the 240 products in
`src/data/products.json`, validates their matching WebP files, and copies only
those assets to `public/images/products/`, where Next.js serves them at
`/images/products/<source-image-id>.webp`.

Usage:
    python3 scripts/sync_product_cutouts.py
"""

import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CATALOGUE = ROOT / "src" / "data" / "products.json"
SOURCE = ROOT.parent / "data" / "mands" / "images_no_background"
DESTINATION = ROOT / "public" / "images" / "products"
LOCAL_PATH = re.compile(r"^/images/products/([0-9a-f]{32})\.webp$")
REMOTE_PATH = re.compile(r"/([0-9a-f]{32})\.jpg$")


def asset_name(image: str) -> str:
    """Return the background-removed filename for a local or legacy CDN URL."""
    match = LOCAL_PATH.match(image) or REMOTE_PATH.search(image)
    if not match:
        raise ValueError(f"Cannot derive a cutout filename from image: {image}")
    return f"{match.group(1)}.webp"


def main() -> None:
    products = json.loads(CATALOGUE.read_text())
    names = [asset_name(product["image"]) for product in products]
    duplicates = len(names) - len(set(names))
    missing = [name for name in names if not (SOURCE / name).is_file()]
    if missing:
        raise SystemExit(
            f"Cannot publish {len(missing)} selected product cutout(s); first missing: {missing[0]}"
        )

    DESTINATION.mkdir(parents=True, exist_ok=True)
    copied = 0
    for product, name in zip(products, names):
        source = SOURCE / name
        destination = DESTINATION / name
        if not destination.exists() or source.stat().st_size != destination.stat().st_size:
            shutil.copy2(source, destination)
            copied += 1
        product["image"] = f"/images/products/{name}"

    CATALOGUE.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n")
    print(
        f"Published {len(names)} selected cutouts ({copied} copied, {duplicates} shared image assets) "
        f"to {DESTINATION.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
