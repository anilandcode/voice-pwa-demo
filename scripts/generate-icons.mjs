import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const accent = { r: 255, g: 90, b: 60, alpha: 1 };

for (const [name, size] of [
  ["192", 192],
  ["512", 512],
  ["512-maskable", 512],
  ["180", 180],
]) {
  await sharp({
    create: { width: size, height: size, channels: 4, background: accent },
  })
    .png()
    .toFile(`public/icons/${name}.png`);
  console.log(`✓ public/icons/${name}.png (${size}x${size})`);
}

console.log("Icons generated.");
