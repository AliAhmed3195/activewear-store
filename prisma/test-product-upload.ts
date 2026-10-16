/**
 * Smoke-test product image upload pipeline (sharp + filesystem).
 * Run: npm run test:upload
 */
import { readFile } from "fs/promises";
import path from "path";
import { saveProductImage } from "../src/lib/product-image-upload";

async function main() {
  const sample = path.join(
    process.cwd(),
    "public/uploads/products/ankle-length-legging.jpg"
  );
  const input = await readFile(sample);
  const saved = await saveProductImage(input, "image/jpeg");
  console.log("Upload pipeline OK:", saved);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
