import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const regularSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Solid Black Background -->
  <rect width="512" height="512" fill="#000000" rx="48" />
  
  <defs>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="25%" stop-color="#e4e4e7" />
      <stop offset="50%" stop-color="#a1a1aa" />
      <stop offset="75%" stop-color="#d4d4d8" />
      <stop offset="100%" stop-color="#71717a" />
    </linearGradient>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#ffffff" flood-opacity="0.2" />
    </filter>
  </defs>

  <!-- Outer Dark Hexagon Base -->
  <polygon
    points="256,36 456,152 456,360 256,476 56,360 56,152"
    fill="#08080c"
    stroke="#3f3f46"
    stroke-width="3"
    stroke-linejoin="round"
  />

  <!-- Main Metallic Silver Hexagon Rim -->
  <polygon
    points="256,44 446,156 446,356 256,468 66,356 66,156"
    fill="#050508"
    stroke="url(#silverGrad)"
    stroke-width="7"
    stroke-linejoin="round"
    filter="url(#subtleGlow)"
  />

  <!-- Inner Subtle Hexagon Groove -->
  <polygon
    points="256,58 432,164 432,348 256,454 80,348 80,164"
    fill="none"
    stroke="#27272a"
    stroke-width="2"
    stroke-linejoin="round"
  />

  <!-- Pure White Capital 'K' Geometric Serif -->
  <g fill="#ffffff" stroke="#ffffff" stroke-width="2">
    <!-- Left Vertical Stem -->
    <path d="M 175 145 L 210 145 L 210 367 L 175 367 Z" />
    <path d="M 160 145 L 225 145 L 225 155 L 160 155 Z" />
    <path d="M 160 357 L 225 357 L 225 367 L 160 367 Z" />

    <!-- Upper Right Diagonal Arm -->
    <path d="M 210 265 L 315 145 L 360 145 L 245 280 Z" />
    <path d="M 305 145 L 368 145 L 368 155 L 305 155 Z" />

    <!-- Lower Right Diagonal Leg -->
    <path d="M 235 268 L 335 367 L 380 367 L 268 255 Z" />
    <path d="M 325 357 L 388 357 L 388 367 L 325 367 Z" />
  </g>
</svg>
`;

// Maskable Icon: Hexagon slightly scaled inside 80% safe zone (safe for circular or squircle adaptive icons)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Solid Black Background with No Radius for Adaptive Clipping -->
  <rect width="512" height="512" fill="#000000" />
  
  <defs>
    <linearGradient id="silverGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="25%" stop-color="#e4e4e7" />
      <stop offset="50%" stop-color="#a1a1aa" />
      <stop offset="75%" stop-color="#d4d4d8" />
      <stop offset="100%" stop-color="#71717a" />
    </linearGradient>
    <filter id="subtleGlowMask" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#ffffff" flood-opacity="0.2" />
    </filter>
  </defs>

  <!-- Scaled Hexagon inside 80% safe zone -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <!-- Outer Dark Hexagon Base -->
    <polygon
      points="256,36 456,152 456,360 256,476 56,360 56,152"
      fill="#08080c"
      stroke="#3f3f46"
      stroke-width="3.5"
      stroke-linejoin="round"
    />

    <!-- Main Metallic Silver Hexagon Rim -->
    <polygon
      points="256,44 446,156 446,356 256,468 66,356 66,156"
      fill="#050508"
      stroke="url(#silverGradMask)"
      stroke-width="8"
      stroke-linejoin="round"
      filter="url(#subtleGlowMask)"
    />

    <!-- Inner Subtle Hexagon Groove -->
    <polygon
      points="256,58 432,164 432,348 256,454 80,348 80,164"
      fill="none"
      stroke="#27272a"
      stroke-width="2.5"
      stroke-linejoin="round"
    />

    <!-- Pure White Capital 'K' Geometric Serif -->
    <g fill="#ffffff" stroke="#ffffff" stroke-width="2">
      <!-- Left Vertical Stem -->
      <path d="M 175 145 L 210 145 L 210 367 L 175 367 Z" />
      <path d="M 160 145 L 225 145 L 225 155 L 160 155 Z" />
      <path d="M 160 357 L 225 357 L 225 367 L 160 367 Z" />

      <!-- Upper Right Diagonal Arm -->
      <path d="M 210 265 L 315 145 L 360 145 L 245 280 Z" />
      <path d="M 305 145 L 368 145 L 368 155 L 305 155 Z" />

      <!-- Lower Right Diagonal Leg -->
      <path d="M 235 268 L 335 367 L 380 367 L 268 255 Z" />
      <path d="M 325 357 L 388 357 L 388 367 L 325 367 Z" />
    </g>
  </g>
</svg>
`;

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write base SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), regularSvg.trim());

  // 1. icon-512.png
  await sharp(Buffer.from(regularSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 2. icon-192.png
  await sharp(Buffer.from(regularSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  // 3. icon-maskable-512.png
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  // 4. icon-maskable-192.png
  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-192.png'));

  // 5. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(regularSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 6. favicon.png (64x64)
  await sharp(Buffer.from(regularSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('✅ Todos los iconos PWA de Agent KODI han sido generados exitosamente con Sharp.');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
