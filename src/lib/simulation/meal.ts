import { catalogue, type CatalogueProduct, type Course } from "@/lib/catalogue";

/** Small, explicit food rules. Catalogue course labels alone do not mean a product is a meal. */
const mainAddOns = /chips|fries|wedges|potato|peas|spinach|baguette|sauce|tagliatelle|chicken fillets|burger|crispy sweet and sour chicken|golden sweet chilli prawn bao buns/i;
const dessertAddOns = /custard|sauce|cookie dough|cookies|ice cream bars/i;
const starterAddOns = /chutney|figs|bloomer|bruschettine|halloumi$|prosciutto|pancetta|bresaola|culatello|nduja picante|hash brown fries/i;
const dipOrSpread = /dip|pâté|pate|parfait|rillette|houmous|antipasti|prosciutto|bresaola|culatello|burrata|puttanesca/i;

export function isCompleteCourseProduct(product: CatalogueProduct, course: Course): boolean {
  if (course === "main") return !mainAddOns.test(product.name);
  if (course === "dessert") return !dessertAddOns.test(product.name);
  if (course === "starter") return !starterAddOns.test(product.name);
  return true;
}

function grams(product: CatalogueProduct): number | null {
  const match = product.weight?.match(/([\d.]+)\s*(kg|g)\b/i);
  if (!match) return null;
  return Number(match[1]) * (match[2].toLowerCase() === "kg" ? 1000 : 1);
}

function mainFamily(name: string): string {
  if (/steak|ribeye|sirloin|rump/i.test(name)) return "steak";
  if (/haddock|salmon|fish/i.test(name)) return "fish";
  if (/pizza/i.test(name)) return "pizza";
  if (/pasta|ravioli|mezzelune|mafalde|lasagne/i.test(name)) return "pasta";
  if (/chicken|duck/i.test(name)) return "poultry";
  if (/pie/i.test(name)) return "pie";
  if (/burger/i.test(name)) return "burger";
  return "other";
}

export interface MealAddition {
  product: CatalogueProduct;
  reason: string;
}

/** Assemble complete food for two; additions are charged and displayed as basket items. */
export function additionsFor(course: Course, primary: CatalogueProduct): MealAddition[] {
  const additions: MealAddition[] = [];
  const find = (id: string) => catalogue.find((product) => product.id === id);

  if (course === "starter" && dipOrSpread.test(primary.name)) {
    const dippers = find(/pâté|pate|parfait|rillette|prosciutto|bresaola|culatello/i.test(primary.name)
      ? "60482122" // Rosemary and olive sourdough crackers
      : "21041908"); // Bruschettine
    if (dippers) additions.push({ product: dippers, reason: "To serve with the starter" });
  }

  if (course === "main") {
    const weight = grams(primary);
    if (weight !== null && weight < 550) {
      const family = mainFamily(primary.name);
      const second = ["steak", "fish", "pasta"].includes(family) ? catalogue
        .filter((item) => item.course === "main" && item.id !== primary.id
          && isCompleteCourseProduct(item, "main") && mainFamily(item.name) === family)
        .sort((a, b) => Math.abs(a.price - primary.price) - Math.abs(b.price - primary.price))[0]
        : undefined;
      additions.push({ product: second ?? primary, reason: "A second main portion for two" });
    }
  }

  if (course === "dessert" && (grams(primary) ?? 999) < 180 && !/^2\b/i.test(primary.name)) {
    additions.push({ product: primary, reason: "A second dessert portion for two" });
  }

  return additions;
}
