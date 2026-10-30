/**
 * Generates responsive AVIF + WebP versions of the universe heroes.
 * Originals live in /source-images (not shipped) and are never modified. Outputs go to /public/img and are committed,
 * so a normal build does not need sharp. Re-run after replacing a hero photograph:
 *   node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/img';
mkdirSync(OUT, { recursive: true });

const desktop = { icon: 'hero-icon.jpg', heritage: 'hero-heritage.jpg', everyday: 'hero-everyday.jpg', motion: 'hero-motion.jpg' };
const mobile  = { icon: 'hero-icon-mobile-new.png', heritage: 'hero-heritage-mobile.png', everyday: 'hero-everyday-mobile.png', motion: 'hero-motion-mobile.png' };

async function emit(src, base, widths) {
  for (const w of widths) {
    const img = sharp(`source-images/${src}`).resize({ width: w, withoutEnlargement: true });
    await img.clone().avif({ quality: 52, effort: 5 }).toFile(`${OUT}/${base}-${w}.avif`);
    await img.clone().webp({ quality: 74 }).toFile(`${OUT}/${base}-${w}.webp`);
  }
}
for (const [id, src] of Object.entries(desktop)) await emit(src, `hero-${id}`, [960, 1440, 1920]);
for (const [id, src] of Object.entries(mobile))  await emit(src, `hero-${id}-m`, [480, 780]);
console.log('done');
