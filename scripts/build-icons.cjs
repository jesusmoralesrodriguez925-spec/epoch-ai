const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createSvg(size, isMaskable = false) {
  // Safe zone for maskable icons: safe diameter is ~80%
  const scale = isMaskable ? 0.65 : 0.82;
  const hexW = size * scale;
  const hexH = hexW * 1.15;
  const cx = size / 2;
  const cy = size / 2;

  // Exact geometric hexagon vertices
  const w2 = hexW / 2;
  const h2 = hexH / 2;
  const p1 = `${cx},${cy - h2}`;
  const p2 = `${cx + w2},${cy - h2 * 0.5}`;
  const p3 = `${cx + w2},${cy + h2 * 0.5}`;
  const p4 = `${cx},${cy + h2}`;
  const p5 = `${cx - w2},${cy + h2 * 0.5}`;
  const p6 = `${cx - w2},${cy - h2 * 0.5}`;
  const points = `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`;

  const strokeW = Math.max(3, size * 0.022);
  const kFontSize = Math.round(hexH * 0.44);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#000000"/>
    <defs>
      <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="25%" stop-color="#e4e4e7"/>
        <stop offset="50%" stop-color="#a1a1aa"/>
        <stop offset="75%" stop-color="#d4d4d8"/>
        <stop offset="100%" stop-color="#71717a"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="${Math.max(2, size * 0.015)}" flood-color="#ffffff" flood-opacity="0.25"/>
      </filter>
    </defs>

    <!-- Dark hexagon base with subtle glow -->
    <polygon points="${points}" fill="#09090e" stroke="#27272a" stroke-width="${strokeW * 0.6}" stroke-linejoin="round"/>

    <!-- Metallic silver rim -->
    <polygon points="${points}" fill="#060609" stroke="url(#silverGrad)" stroke-width="${strokeW}" stroke-linejoin="round" filter="url(#glow)"/>

    <!-- Inner decorative border -->
    <polygon points="${points}" fill="none" stroke="#27272a" stroke-width="${strokeW * 0.3}" transform="scale(0.92) translate(${cx * 0.08}, ${cy * 0.08})" stroke-linejoin="round"/>

    <!-- Pure White Capital 'K' Geometric Serif Letter -->
    <g fill="#ffffff">
      <!-- Left vertical stem -->
      <rect x="${cx - kFontSize * 0.28}" y="${cy - kFontSize * 0.42}" width="${kFontSize * 0.12}" height="${kFontSize * 0.84}" rx="${kFontSize * 0.01}"/>
      <!-- Top serif -->
      <rect x="${cx - kFontSize * 0.34}" y="${cy - kFontSize * 0.42}" width="${kFontSize * 0.24}" height="${kFontSize * 0.04}"/>
      <!-- Bottom serif -->
      <rect x="${cx - kFontSize * 0.34}" y="${cy + kFontSize * 0.38}" width="${kFontSize * 0.24}" height="${kFontSize * 0.04}"/>

      <!-- Upper right arm -->
      <polygon points="${cx - kFontSize * 0.17},${cy + kFontSize * 0.02} ${cx + kFontSize * 0.22},${cy - kFontSize * 0.42} ${cx + kFontSize * 0.34},${cy - kFontSize * 0.42} ${cx - kFontSize * 0.04},${cy + kFontSize * 0.08}"/>
      <!-- Upper right arm serif -->
      <rect x="${cx + kFontSize * 0.18}" y="${cy - kFontSize * 0.42}" width="${kFontSize * 0.18}" height="${kFontSize * 0.04}"/>

      <!-- Lower right leg -->
      <polygon points="${cx - kFontSize * 0.09},${cy - kFontSize * 0.02} ${cx + kFontSize * 0.26},${cy + kFontSize * 0.42} ${cx + kFontSize * 0.38},${cy + kFontSize * 0.42} ${cx + kFontSize * 0.02},${cy - kFontSize * 0.06}"/>
      <!-- Lower right leg serif -->
      <rect x="${cx + kFontSize * 0.22}" y="${cy + kFontSize * 0.38}" width="${kFontSize * 0.18}" height="${kFontSize * 0.04}"/>
    </g>
  </svg>`;
}

async function build() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const tasks = [
    { file: 'favicon.png', size: 64, maskable: false },
    { file: 'icon-192.png', size: 192, maskable: false },
    { file: 'icon-512.png', size: 512, maskable: false },
    { file: 'icon-maskable-192.png', size: 192, maskable: true },
    { file: 'icon-maskable-512.png', size: 512, maskable: true },
    { file: 'apple-touch-icon.png', size: 180, maskable: false }
  ];

  for (const t of tasks) {
    const dest = path.join(publicDir, t.file);
    const svgContent = createSvg(t.size, t.maskable);
    await sharp(Buffer.from(svgContent)).png({ quality: 100, compressionLevel: 9 }).toFile(dest);
    console.log(`Generated ${t.file} (${t.size}x${t.size}, maskable: ${t.maskable})`);
  }

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), createSvg(512, false), 'utf8');
  console.log('Generated icon.svg (512x512 vector)');
}

build().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
