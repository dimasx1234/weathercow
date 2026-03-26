import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "public", "images");
const outputDir = path.join(rootDir, "public", "images", "small");

const WIDTH = 320;

await mkdir(outputDir, { recursive: true });

const entries = await readdir(sourceDir, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => /\.(png|jpg|jpeg|webp|gif)$/i.test(name))
  .sort((a, b) => a.localeCompare(b));

await Promise.all(
  files.map(async (file) => {
    const input = path.join(sourceDir, file);
    const output = path.join(outputDir, file);
    await sharp(input)
      .resize({ width: WIDTH, withoutEnlargement: true })
      .toFile(output);
  })
);

console.log(`Generated ${files.length} resized images in public/images/small (width=${WIDTH}px).`);
