/** Client fabric catalog — from supplier fabric details PDF (sublimation tees). */
export type FabricOption = {
  id: string;
  name: string;
  gsm: string;
  feel: string;
  ratePkr: number;
  productType: string;
  highlights: string[];
};

export const FABRIC_OPTIONS: FabricOption[] = [
  {
    id: "popcorn-lycra",
    name: "Popcorn Lycra",
    gsm: "130–145 GSM",
    feel: "Soft and cool",
    ratePkr: 2100,
    productType: "Full sublimation t-shirt",
    highlights: ["Textured popcorn knit", "Cool next-to-skin feel", "Full sublimation ready"],
  },
  {
    id: "mesh-chawaldana",
    name: "Mesh (Chawaldana)",
    gsm: "150–160 GSM",
    feel: "Soft and cool",
    ratePkr: 1100,
    productType: "Full sublimation t-shirt",
    highlights: ["Breathable mesh", "Lightweight training feel", "Full sublimation ready"],
  },
  {
    id: "pk-dot",
    name: "P.K Dot",
    gsm: "140–150 GSM",
    feel: "Soft and classic",
    ratePkr: 1250,
    productType: "Full sublimation t-shirt",
    highlights: ["Piqué / dot texture", "Clean athletic look", "Full sublimation ready"],
  },
  {
    id: "butter",
    name: "Butter",
    gsm: "140–145 GSM",
    feel: "Soft and feeless",
    ratePkr: 1250,
    productType: "Full sublimation t-shirt",
    highlights: ["Butter-soft handfeel", "Smooth drape", "Full sublimation ready"],
  },
  {
    id: "sk",
    name: "S.K",
    gsm: "150–165 GSM",
    feel: "Soft and feeless",
    ratePkr: 1150,
    productType: "Full sublimation t-shirt",
    highlights: ["Durable knit", "Soft handfeel", "Full sublimation ready"],
  },
  {
    id: "tricot",
    name: "Tricot",
    gsm: "140–155 GSM",
    feel: "Soft and classic",
    ratePkr: 1250,
    productType: "Full sublimation t-shirt",
    highlights: ["Fine rib / tricot texture", "Classic sports finish", "Full sublimation ready"],
  },
  {
    id: "lycra-mesh",
    name: "Lycra Mesh",
    gsm: "140–150 GSM",
    feel: "Soft and classic",
    ratePkr: 2100,
    productType: "Full sublimation t-shirt",
    highlights: ["Stretch mesh", "Breathable recovery", "Full sublimation ready"],
  },
];

export const FABRIC_QUALITY_POINTS = [
  "Performance knits selected for training and everyday wear",
  "Full sublimation compatible — ideal for team kits & custom print",
  "GSM ranges tuned for breathability without feeling flimsy",
  "Soft handfeel options: popcorn, mesh, butter, tricot & more",
];

/** Heuristic match product material string → fabric option */
export function matchFabric(material?: string | null): FabricOption | null {
  if (!material) return null;
  const m = material.toLowerCase();
  return (
    FABRIC_OPTIONS.find(
      (f) =>
        m.includes(f.name.toLowerCase()) ||
        m.includes(f.id.replace(/-/g, " ")) ||
        (f.id === "mesh-chawaldana" && (m.includes("mesh") || m.includes("chawaldana"))) ||
        (f.id === "pk-dot" && (m.includes("p.k") || m.includes("pk dot") || m.includes("pique"))) ||
        (f.id === "lycra-mesh" && m.includes("lycra mesh")) ||
        (f.id === "popcorn-lycra" && m.includes("popcorn"))
    ) ?? null
  );
}
