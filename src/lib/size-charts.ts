export type SizeRow = {
  size: string;
  chest?: string;
  length?: string;
  sleeve?: string;
  waist?: string;
  hip?: string;
  inseam?: string;
};

export const SHIRT_SIZE_CHART: SizeRow[] = [
  { size: "S", chest: "36–38", length: "27", sleeve: "8" },
  { size: "M", chest: "38–40", length: "28", sleeve: "8.5" },
  { size: "L", chest: "40–42", length: "29", sleeve: "9" },
  { size: "XL", chest: "42–44", length: "30", sleeve: "9.5" },
  { size: "XXL", chest: "44–46", length: "31", sleeve: "10" },
];

export const TROUSER_SIZE_CHART: SizeRow[] = [
  { size: "S", waist: "28–30", hip: "36–38", inseam: "30", length: "39" },
  { size: "M", waist: "30–32", hip: "38–40", inseam: "30.5", length: "40" },
  { size: "L", waist: "32–34", hip: "40–42", inseam: "31", length: "41" },
  { size: "XL", waist: "34–36", hip: "42–44", inseam: "31.5", length: "42" },
  { size: "XXL", waist: "36–38", hip: "44–46", inseam: "32", length: "43" },
];

export const SIZE_GUIDE_NOTES = [
  "Measurements in inches. Lay garment flat for best comparison.",
  "Fit is athletic / true to size — size up for a relaxed look.",
  "Need team kits or custom measurements? Use Custom / Teams.",
];
