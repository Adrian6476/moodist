#!/usr/bin/env node

import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'ios-assets');
const BG_COLOR = '#18181b';

// 需要生成的图标尺寸
const ICONS = [
  { name: 'icons/apple-touch-icon.png', size: 180 },
];

// 启动画面尺寸
const SPLASH_SCREENS = [
  // iPhone XR, 11
  { name: 'splash/iphone-xr-11.png', width: 828, height: 1792 },
  // iPhone 11 Pro
  { name: 'splash/iphone-11-pro.png', width: 1125, height: 2436 },
  // iPhone 11 Pro Max
  { name: 'splash/iphone-11-pro-max.png', width: 1242, height: 2688 },
  // iPhone 12 mini, 13 mini
  { name: 'splash/iphone-12-13-mini.png', width: 1080, height: 2340 },
  // iPhone 12, 12 Pro, 13, 13 Pro, 14
  { name: 'splash/iphone-12-13-14.png', width: 1170, height: 2532 },
  // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
  { name: 'splash/iphone-12-13-pro-max-14-plus.png', width: 1284, height: 2778 },
  // iPhone 14 Pro, 15, 15 Pro
  { name: 'splash/iphone-14-15-pro.png', width: 1179, height: 2556 },
  // iPhone 14 Pro Max, 15 Plus, 15 Pro Max
  { name: 'splash/iphone-14-15-pro-max.png', width: 1290, height: 2796 }
];

async function ensureDirectoryExists(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

async function generateIcon(logoPath, outputPath, size) {
  // 创建一个size x size的黑色背景
  const background = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG_COLOR
    }
  }).png().toBuffer();

  // 读取SVG并调整大小（保持原始比例）
  const logo = await sharp(logoPath)
    .resize(Math.round(size * 0.7), Math.round(size * 0.7), {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  // 在背景中央合成logo
  await sharp(background)
    .composite([{
      input: logo,
      gravity: 'center'
    }])
    .toFile(outputPath);
}

async function generateSplashScreen(logoPath, outputPath, width, height) {
  // logo高度为屏幕高度的25%
  const logoSize = Math.round(height * 0.25);

  // 创建背景
  const background = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG_COLOR
    }
  }).png().toBuffer();

  // 读取并调整logo大小
  const logo = await sharp(logoPath)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  // 在背景中央合成logo
  await sharp(background)
    .composite([{
      input: logo,
      gravity: 'center'
    }])
    .toFile(outputPath);
}

async function main() {
  try {
    console.log('开始生成图标和启动画面...');

    // 确保输出目录存在
    await ensureDirectoryExists(OUTPUT_DIR);
    await ensureDirectoryExists(path.join(OUTPUT_DIR, 'icons'));
    await ensureDirectoryExists(path.join(OUTPUT_DIR, 'splash'));

    // 生成图标
    for (const icon of ICONS) {
      console.log(`生成 ${icon.name}...`);
      const outputPath = path.join(OUTPUT_DIR, icon.name);
      await generateIcon(LOGO_PATH, outputPath, icon.size);
    }

    // 生成启动画面
    for (const screen of SPLASH_SCREENS) {
      console.log(`生成 ${screen.name}...`);
      const outputPath = path.join(OUTPUT_DIR, screen.name);
      await generateSplashScreen(LOGO_PATH, outputPath, screen.width, screen.height);
    }

    console.log('\n生成完成！生成的文件：');
    console.log('\n图标：');
    console.log('- ios-assets/icons/apple-touch-icon.png (180x180)');
    console.log('\n启动画面：');
    console.log('- ios-assets/splash/iphone-xr-11.png (828x1792)');
    console.log('- ios-assets/splash/iphone-11-pro.png (1125x2436)');
    console.log('- ios-assets/splash/iphone-11-pro-max.png (1242x2688)');
    console.log('- ios-assets/splash/iphone-12-13-mini.png (1080x2340)');
    console.log('- ios-assets/splash/iphone-12-13-14.png (1170x2532)');
    console.log('- ios-assets/splash/iphone-12-13-pro-max-14-plus.png (1284x2778)');
    console.log('- ios-assets/splash/iphone-14-15-pro.png (1179x2556)');
    console.log('- ios-assets/splash/iphone-14-15-pro-max.png (1290x2796)');
  } catch (error) {
    console.error('生成过程中出错：', error);
    process.exit(1);
  }
}

main();