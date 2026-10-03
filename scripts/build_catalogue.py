"""Turn the raw M&S scrape into the Date Night catalogue the simulator uses.

    python3 scripts/build_catalogue.py

Reads  data/mands_food_products.csv            (raw scrape with store prices, ~6.7k rows)
       ../research/output/products_spotted.csv (products couples bought on TikTok)
Writes src/data/products.json                  (curated catalogue, imported by the app)
       src/data/catalogue_meta.json            (price store, capture date, coverage)

Every product a couple was seen buying on TikTok is kept, with its mention count
as `trendSignal`. The rest of each course is filled with the most date-night-
relevant products. Behavioural attributes are keyword heuristics on name, brand
and labels: explainable and cheap, no LLM call per product.
"""

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "mands_food_products.csv"
SPOTTED = ROOT.parent / "research" / "output" / "products_spotted.csv"
OUT = ROOT / "src" / "data" / "products.json"
META = ROOT / "src" / "data" / "catalogue_meta.json"

COURSES = ["starter", "main", "side", "dessert", "drink", "wildcard"]
MAX_PER_COURSE = 40
MAX_PER_FAMILY = 5

# Caps near-duplicates (15 steaks, 12 proseccos) so each course has variety.
FAMILIES = [
    "steak", "pizza", "lasagne", "risotto", "curry", "pie", "ravioli", "pasta", "bao",
    "prosecco", "champagne", "sparkling", "rosé", "malbec", "rioja", "pinot", "sauvignon",
    "tiramisu", "cheesecake", "ice cream", "tart", "pudding", "eclair", "éclair", "macaroon",
    "truffles", "florentine", "chocolate", "cookies", "pistachio", "crisps", "popcorn",
    "olives", "houmous", "prosciutto", "parfait", "rillette", "dip", "croquettes",
    "garlic", "yorkshire", "dauphinoise", "fries", "mash", "cauliflower cheese",
]


def family(name):
    lower = name.lower()
    return next((f for f in FAMILIES if f in lower), lower)

# Anything seasonal, kid-focused or not a date-night buy.
GLOBAL_EXCLUDE = [
    "halloween", "christmas", "festive", "kids", "colin the caterpillar",
    "make your own", "decorate your own", "monster", "football", "baby",
    "meal for one", "multipack", "6 pack", "12 pack", "everyday",
]


def has(text, words):
    return any(w in text for w in words)


def course_for(row):
    """Map a raw row onto a mission course, or None to drop it."""
    name = row["name"].lower()
    cats = row["categories"].lower()
    reason = row["course_reason"].lower()
    course = row["course_type"]
    conf = row["course_confidence"]

    if has(name, GLOBAL_EXCLUDE) or has(cats, ["christmas", "halloween", "household", "pet"]):
        return None

    if course == "starter" and conf != "low":
        if has(name, ["reduced fat", "egg mayonnaise", "chips", "pave", "soup", "filler", "mix"]):
            return None
        return "starter"

    if course == "main" and conf != "low":
        if has(name, ["sandwich", "wrap", "baguette", "soup", "sauce", "sausages",
                      "whole chicken", "joint", "turkey", "bar", "salt beef", "platter",
                      "braising", "shin", "veal", "leg steak", "loin steak", "venison",
                      "basa", "slices", "kids", "fingers", "mini fillets"]):
            return None
        if has(reason, ["subcategory: protein", "subcategory: fresh pasta sauces"]):
            return None
        if "main-food aisle" in reason and not has(name, ["steak", "fillet", "salmon", "cod", "chicken breast"]):
            return None
        return "main"

    if course == "other" and has(reason, ["subcategory: side", "prepared vegetables and sides",
                                          "garlic bread", "potato salads"]):
        if has(name, ["mashing potatoes", "baking potatoes"]):
            return None
        return "side"
    if has(name, ["doughballs", "dauphinoise", "roast potatoes", "triple cooked chips",
                  "halloumi fries", "garlic bread"]) and "crisps" not in name:
        return "side"

    if course == "dessert" and conf != "low":
        if has(name, ["haggis", "black pudding", "yorkshire", "custard cream", "biscuit",
                      "cupcake", "jaffa", "ice lolly", "christmas pudding", "rice pudding",
                      "spread", "drink", "milk chocolate coated", "mix", "dough", "brioche",
                      "twist", "shortbread", "cookie", "dip", "rolls", "loaf", "cavapoo", "dundee", "genoa"]):
            return None
        if "chocolate" in reason and not has(cats, ["chilled desserts", "bakery", "frozen"]):
            return "wildcard"  # boxed chocolates / truffles read as a treat, not a pudding
        return "dessert"

    if course == "drink" and conf != "low":
        if has(name, ["tea", "coffee", "shot", "protein", "kefir", "squash", "water",
                      "mulled", "milkshake", "smoothie", "infusion", "juice", "vodka",
                      "whisky", "gin ", "rum", "bag in box", "magnum", "case", "sauce",
                      "chocolate", "truffles", "half bottle", "marmalade", "kombucha"]):
            return None
        return "drink"

    if course == "snack" and conf != "low":
        if has(name, ["protein", "rice cakes", "fruit bar", "flapjack", "lunchbox", "reduced fat"]):
            return None
        return "wildcard"

    return None


def score(text, base, plus=(), minus=()):
    value = base
    for words, delta in plus:
        if has(text, words):
            value += delta
    for words, delta in minus:
        if has(text, words):
            value -= delta
    return round(max(0.05, min(0.98, value)), 2)


def attributes(row, course):
    name = row["name"].lower()
    brand = row["brand"].lower()
    labels = row["labels"].lower()
    text = f"{name} {brand}"
    is_new = "new in" in labels
    is_eat_well = "eat well" in labels or "count on us" in brand

    premium = score(text, 0.35, plus=[
        (["collection"], 0.35),
        (["gastropub", "wagyu", "aberdeen angus", "champagne", "truffle", "fillet",
          "ribeye", "sirloin", "lobster", "scallop", "burrata", "prosecco"], 0.25),
        (["our best ever", "dine in", "slow cooked"], 0.15),
    ], minus=[(["count on us", "value", "basics"], 0.2)])

    indulgent = score(text, {"dessert": 0.7, "wildcard": 0.55}.get(course, 0.4), plus=[
        (["chocolate", "cheese", "cream", "butter", "truffle", "toffee", "caramel",
          "fudge", "brownie", "cheesecake", "battered", "mac", "pizza", "dauphinoise",
          "garlic", "salted", "melt", "tiramisu", "pudding", "fries"], 0.25),
    ], minus=[(["light", "reduced", "count on us", "plant kitchen", "salad"], 0.25)])
    if is_eat_well:
        indulgent = round(max(0.05, indulgent - 0.2), 2)

    healthy = score(text, 0.6 if is_eat_well else 0.3, plus=[
        (["salad", "green", "vegetable", "high protein", "plant kitchen", "salmon",
          "count on us", "beans", "broccoli"], 0.2),
    ], minus=[(["chocolate", "battered", "cheese", "cream", "fudge", "fries"], 0.2)])

    adventurous = score(text, 0.3 + (0.2 if is_new else 0), plus=[
        (["nduja", "gyoza", "bao", "korean", "thai", "katsu", "harissa", "miso",
          "chilli", "kimchi", "tagine", "mezze", "labneh", "japanese", "pil pil",
          "peri", "sriracha", "gochujang", "yuzu", "truffle", "hot honey", "dumpling",
          "pistachio", "biryani", "pad", "spanish", "greek", "vietnamese"], 0.35),
    ])

    romantic = score(text, 0.3, plus=[
        (["prosecco", "champagne", "rosé", "rose", "cava", "fizz", "sparkling"], 0.45),
        (["chocolate", "strawberr", "raspberr", "steak", "truffle", "for two",
          "heart", "lobster", "tiramisu", "fondant", "pinot", "malbec", "rioja"], 0.3),
    ])

    shareable = score(text, 0.35, plus=[
        (["platter", "sharing", "selection", "dip", "for two", "pizza", "doughballs",
          "olives", "antipasti", "crisps", "popcorn", "board", "houmous", "tear"], 0.35),
        ([" 2 ", "2 ", "4 "], 0.15),
    ])

    viral = score(text, 0.3 + (0.3 if is_new else 0), plus=[
        (["hot honey", "nduja", "pistachio", "dubai", "crispy chilli", "burrata",
          "tiramisu", "truffle", "mac and cheese", "gochujang", "colin", "percy",
          "prosecco", "halloumi fries", "dumpling", "bao"], 0.3),
    ])

    familiar = round(max(0.05, min(0.98, 0.85 - adventurous * 0.6 + (
        0.15 if has(name, ["lasagne", "cottage pie", "fish and chips", "chips", "garlic bread",
                            "cheesecake", "sticky toffee", "chicken", "pizza"]) else 0))), 2)

    return {
        "premium": premium,
        "indulgent": indulgent,
        "healthy": healthy,
        "adventurous": adventurous,
        "romantic": romantic,
        "shareable": shareable,
        "viralPotential": viral,
        "familiar": familiar,
    }


def dietary(row):
    tags = row["dietary_tags"].lower() + " " + row["brand"].lower()
    out = []
    if "vegan" in tags or "plant kitchen" in tags:
        out += ["vegan", "vegetarian"]
    elif "vegetarian" in tags:
        out.append("vegetarian")
    if "made without" in tags:
        out.append("gluten-free")
    return out


def load_spotted():
    """product_id -> what TikTok showed about it. Missing file means no TikTok data."""
    if not SPOTTED.exists():
        return {}
    spotted = {}
    with SPOTTED.open() as f:
        for r in csv.DictReader(f):
            first = (r["courses"].split() or ["main"])[0]
            spotted[r["product_id"]] = {
                "course": first if first in COURSES else "wildcard",
                "trendSignal": float(r["trend_boost"] or 0),
                "mentions": int(r["mentions"] or 0),
                "posts": r["posts"].split(),
            }
    return spotted


def product_entry(row, course, seen):
    attrs = attributes(row, course)
    return {
        "id": row["product_id"],
        "name": re.sub(r"<[^>]+>", "", row["name"]).strip(),
        "course": course,
        "price": float(row["price_gbp"]),
        "priceBasis": row["price_basis"] or "each",
        "brand": row["brand"] or None,
        "weight": row["weight"] or None,
        "description": row["description"] or None,
        "dietary": dietary(row),
        "isNew": "new in" in row["labels"].lower(),
        # Ask the M&S CDN for a carousel-sized image instead of 1280px.
        "image": row["image_url"].replace("w_1280", "w_480"),
        "url": row["source_url"],
        "attributes": attrs,
        "trendSignal": seen["trendSignal"] if seen else 0,
        "observedMentions": seen["mentions"] if seen else 0,
        "observedPosts": seen["posts"] if seen else [],
    }


def main():
    with RAW.open() as f:
        rows = [r for r in csv.DictReader(f) if r["price_status"] == "ok" and r["image_url"]]

    spotted = load_spotted()
    seen_names = set()
    observed = {c: [] for c in COURSES}
    candidates = {c: [] for c in COURSES}

    # Products couples were filmed buying go in first and skip the course filters.
    for row in rows:
        seen = spotted.get(row["product_id"])
        if seen:
            observed[seen["course"]].append(product_entry(row, seen["course"], seen))
            seen_names.add(re.sub(r"\W+", " ", row["name"].lower()).strip())

    for row in rows:
        if row["product_id"] in spotted:
            continue
        course = course_for(row)
        if not course:
            continue
        key = re.sub(r"\W+", " ", row["name"].lower()).strip()
        if key in seen_names:
            continue
        seen_names.add(key)
        candidates[course].append(product_entry(row, course, None))

    catalogue = []
    for course in COURSES:
        kept = sorted(observed[course], key=lambda p: -p["observedMentions"])
        # Fill the rest of the course with the most date-night-relevant products.
        candidates[course].sort(key=lambda p: -(
            p["attributes"]["romantic"] + p["attributes"]["indulgent"]
            + p["attributes"]["premium"] + p["attributes"]["viralPotential"]))
        family_counts = {}
        for item in candidates[course]:
            if len(kept) >= MAX_PER_COURSE:
                break
            fam = family(item["name"])
            if family_counts.get(fam, 0) >= MAX_PER_FAMILY:
                continue
            family_counts[fam] = family_counts.get(fam, 0) + 1
            kept.append(item)
        catalogue += kept

    OUT.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")

    store = rows[0]
    observed_count = sum(len(v) for v in observed.values())
    meta = {
        "priceStore": {
            "id": store["price_store_id"],
            "name": store["price_store_name"].title(),
            "address": store["price_store_address"],
            "url": store["price_store_url"],
        },
        "pricesCapturedAt": store["price_captured_at"],
        "rawProducts": len(rows),
        "catalogueProducts": len(catalogue),
        "perCourse": {c: sum(1 for p in catalogue if p["course"] == c) for c in COURSES},
        "tiktokProductsSpotted": sum(1 for _ in csv.DictReader(SPOTTED.open())) if SPOTTED.exists() else 0,
        "tiktokProductsInCatalogue": observed_count,
    }
    META.write_text(json.dumps(meta, indent=2) + "\n")

    print(f"Wrote {len(catalogue)} products to {OUT.relative_to(ROOT)}: {meta['perCourse']}")
    print(f"TikTok products included: {observed_count}/{meta['tiktokProductsSpotted']}")
    print(f"Prices: {meta['priceStore']['name']}, captured {meta['pricesCapturedAt']}")


if __name__ == "__main__":
    main()
