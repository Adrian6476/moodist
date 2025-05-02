import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const INPUT_SVG = 'public/favicon.svg';
const OUTPUT_DIR = 'public/assets/splash';
const BACKGROUND_COLOR = '#09090b'; // Same as theme-color in astro.config.mjs
const DPI = 300; // Density for SVG rendering

const SIZES = [
  // iPhones (Portrait)
  { width: 750, height: 1334, iconSize: 256 }, // iPhone 6/7/8/SE(2nd/3rd)
  { width: 1125, height: 2436, iconSize: 256 }, // iPhone X/XS/11 Pro
  { width: 1170, height: 2532, iconSize: 512 }, // iPhone 12/13/14/15 (Pro)
  { width: 1284, height: 2778, iconSize: 512 }, // iPhone 12/13 Pro Max, 14 Plus
  { width: 1290, height: 2796, iconSize: 512 }, // iPhone 14/15 Pro Max
  // iPads (Portrait)
  { width: 1536, height: 2048, iconSize: 512 }, // iPad Mini/Air/3/4/5/6/7/8/9, Pro 9.7"
  { width: 1668, height: 2224, iconSize: 512 }, // iPad Air 3, Pro 10.5"
  { width: 1668, height: 2388, iconSize: 512 }, // iPad Pro 11" (Gen 1-4)
  { width: 1770, height: 2360, iconSize: 512 }, // iPad Air 4/5, iPad 10
  { width: 2048, height: 2732, iconSize: 512 }, // iPad Pro 12.9" (Gen 1-6)
];

async function generateSplashScreens() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Ensured output directory exists: ${OUTPUT_DIR}`);

    for (const { width, height, iconSize } of SIZES) {
      const outputFileName = `apple-launch-${width}x${height}.png`;
      const outputPath = path.join(OUTPUT_DIR, outputFileName);

      console.log(`Generating ${outputFileName} (${width}x${height})...`);

      // Create background canvas
      const background = sharp({
        create: {
          width: width,
          height: height,
          channels: 4, // Use 4 channels for RGBA
          background: BACKGROUND_COLOR,
        },
      });

      // Load SVG, render at high DPI, resize
      const resizedIconBuffer = await sharp(INPUT_SVG, { density: DPI })
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        }) // Resize icon, ensure transparent background
        .png() // Convert to PNG buffer
        .toBuffer();

      // Composite icon onto background
      await background
        .composite([{ input: resizedIconBuffer, gravity: 'center' }])
        .png() // Ensure output is PNG
        .toFile(outputPath);

      console.log(` -> Saved ${outputFileName}`);
    }

    console.log('\nSplash screen generation complete!');
  } catch (error) {
    console.error('Error generating splash screens:', error);
    process.exit(1); // Exit with error code
  }
}

generateSplashScreens();
