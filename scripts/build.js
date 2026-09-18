const fs = require('fs');
const path = require('path');
const assert = require('assert');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'src');
const outputDir = path.join(root, 'dist');
const packageDir = path.join(outputDir, 'kairos-armadillo');

const CELL_W = 192;
const CELL_H = 208;
const COLS = 8;
const V1_ROWS = 9;
const V2_ROWS = 11;

const usedColumns = [6, 8, 8, 4, 5, 8, 6, 6, 6];

const sourceUrl = (index) =>
  `https://github.com/kairos-io/community/blob/main/artwork/mascot/SVG/Armadillo%20${index}.svg`;

function transparentCanvas(width, height) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });
}

async function makeSprite(index, options = {}) {
  const {
    flip = false,
    scale = 1,
    angle = 0,
    x = 0,
    y = 0,
    targetWidth = 168,
    targetHeight = 178,
    baseline = 198,
  } = options;

  const svgPath = path.join(sourceDir, `armadillo-${index}.svg`);
  let image = sharp(svgPath, { density: 720 }).resize({
    width: Math.max(1, Math.round(targetWidth * scale)),
    height: Math.max(1, Math.round(targetHeight * scale)),
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (flip) image = image.flop();
  if (angle !== 0) {
    image = image.rotate(angle, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  const rendered = await image.png().toBuffer({ resolveWithObject: true });
  const left = Math.round((CELL_W - rendered.info.width) / 2 + x);
  const top = Math.round(baseline - rendered.info.height + y);

  return transparentCanvas(CELL_W, CELL_H)
    .composite([{ input: rendered.data, left, top }])
    .png()
    .toBuffer();
}

async function buildRows() {
  const rows = [];

  const idleY = [0, -1, -2, -1, 0, 1];
  rows.push(await Promise.all(idleY.map((y, i) => makeSprite(2, {
    y,
    scale: [0.97, 0.98, 0.99, 1, 0.99, 0.98][i],
    angle: [-1, 0, 1, 0, -1, 0][i],
  }))));

  const gaitX = [-7, -4, 0, 4, 7, 4, 0, -4];
  const gaitY = [1, -2, -4, -2, 1, -2, -4, -2];
  rows.push(await Promise.all(gaitX.map((x, i) => makeSprite(5, {
    x,
    y: gaitY[i],
    scale: [0.93, 0.96, 0.99, 0.96, 0.93, 0.96, 0.99, 0.96][i],
    targetWidth: 174,
    targetHeight: 172,
  }))));

  rows.push(await Promise.all(gaitX.map((x, i) => makeSprite(5, {
    flip: true,
    x: -x,
    y: gaitY[i],
    scale: [0.93, 0.96, 0.99, 0.96, 0.93, 0.96, 0.99, 0.96][i],
    targetWidth: 174,
    targetHeight: 172,
  }))));

  rows.push(await Promise.all([0, 1, 2, 3].map((i) => makeSprite(3, {
    y: [2, 0, -2, 0][i],
    angle: [-2, 0, 2, 0][i],
    scale: [0.96, 0.99, 1, 0.98][i],
    targetHeight: 184,
  }))));

  rows.push(await Promise.all([0, 1, 2, 3, 4].map((i) => makeSprite(6, {
    y: [8, 2, -10, -2, 8][i],
    scale: [0.94, 0.98, 1, 0.98, 0.94][i],
    targetWidth: 172,
    targetHeight: 176,
  }))));

  rows.push(await Promise.all([0, 1, 2, 3, 4, 5, 6, 7].map((i) => makeSprite(1, {
    y: [0, 1, 2, 1, 0, 1, 2, 1][i],
    angle: [-3, -1, 1, 3, 2, 0, -2, 0][i],
    scale: [0.96, 0.97, 0.98, 0.99, 1, 0.99, 0.98, 0.97][i],
    targetWidth: 166,
    targetHeight: 166,
  }))));

  rows.push(await Promise.all([0, 1, 2, 3, 4, 5].map((i) => makeSprite(2, {
    y: [1, 0, -1, -2, -1, 0][i],
    angle: [-2, -1, 0, 1, 0, -1][i],
    scale: [0.96, 0.98, 1, 1, 0.98, 0.97][i],
  }))));

  rows.push(await Promise.all([0, 1, 2, 3, 4, 5].map((i) => makeSprite(4, {
    y: [2, 0, -2, 0, 2, 0][i],
    angle: [-2, 0, 2, 0, -2, 0][i],
    scale: [0.95, 0.98, 1, 0.98, 0.95, 0.98][i],
    targetHeight: 182,
  }))));

  rows.push(await Promise.all([0, 1, 2, 3, 4, 5].map((i) => makeSprite(2, {
    y: [0, -1, -2, -1, 0, 1][i],
    angle: [-3, -2, -1, 0, 1, 0][i],
    scale: [0.96, 0.98, 1, 1, 0.98, 0.97][i],
  }))));

  const lookSpecs = [
    { index: 6, flip: false, scale: 0.96 },
    { index: 6, flip: false, scale: 0.97, angle: 1 },
    { index: 5, flip: false, scale: 0.96, angle: -2 },
    { index: 5, flip: false, scale: 0.98, angle: -1 },
    { index: 3, flip: false, scale: 0.96 },
    { index: 3, flip: false, scale: 0.98, angle: 1 },
    { index: 3, flip: false, scale: 0.99, angle: 2 },
    { index: 3, flip: false, scale: 1 },
    { index: 3, flip: true, scale: 1 },
    { index: 4, flip: true, scale: 0.99, angle: -2 },
    { index: 4, flip: true, scale: 0.98, angle: -1 },
    { index: 4, flip: true, scale: 0.97 },
    { index: 2, flip: false, scale: 0.98 },
    { index: 2, flip: false, scale: 0.97, angle: -1 },
    { index: 6, flip: true, scale: 0.97, angle: -1 },
    { index: 6, flip: true, scale: 0.96 },
  ];

  const lookFrames = await Promise.all(lookSpecs.map((spec) => makeSprite(spec.index, {
    flip: spec.flip,
    scale: spec.scale,
    angle: spec.angle || 0,
    targetWidth: 168,
    targetHeight: 178,
  })));
  rows.push(lookFrames.slice(0, 8));
  rows.push(lookFrames.slice(8));

  return rows;
}

async function composeAtlas(rows, rowCount) {
  const composites = [];
  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < rows[row].length; col += 1) {
      composites.push({
        input: rows[row][col],
        left: col * CELL_W,
        top: row * CELL_H,
      });
    }
  }
  if (rowCount === V2_ROWS) {
    composites.push({
      input: rows[0][0],
      left: 6 * CELL_W,
      top: 0,
    });
  }
  return transparentCanvas(COLS * CELL_W, rowCount * CELL_H)
    .composite(composites)
    .png()
    .toBuffer();
}

async function makePreview(atlasBuffer) {
  const rowLabels = [
    'idle',
    'running-right',
    'running-left',
    'waving',
    'jumping',
    'failed',
    'waiting',
    'running',
    'review',
    'look 000-157.5',
    'look 180-337.5',
  ];
  const labelWidth = 180;
  const scale = 0.5;
  const scaledCellW = Math.round(CELL_W * scale);
  const scaledCellH = Math.round(CELL_H * scale);
  const scaledAtlas = await sharp(atlasBuffer)
    .resize(COLS * scaledCellW, V2_ROWS * scaledCellH, { kernel: 'nearest' })
    .flatten({ background: '#f4f5f7' })
    .png()
    .toBuffer();
  const labels = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${labelWidth}" height="${V2_ROWS * scaledCellH}">` +
      `<rect width="100%" height="100%" fill="#ffffff"/>` +
      rowLabels.map((label, row) =>
        `<text x="12" y="${row * scaledCellH + 58}" font-family="Arial, sans-serif" font-size="17" fill="#202124">${label}</text>`,
      ).join('') +
    `</svg>`,
  );
  return sharp({
    create: {
      width: labelWidth + COLS * scaledCellW,
      height: V2_ROWS * scaledCellH,
      channels: 4,
      background: '#ffffff',
    },
  })
    .composite([
      { input: labels, left: 0, top: 0 },
      { input: scaledAtlas, left: labelWidth, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function validateAtlas(atlasBuffer, rowCount) {
  const image = await sharp(atlasBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = image.info;
  assert.strictEqual(width, COLS * CELL_W);
  assert.strictEqual(height, rowCount * CELL_H);
  assert.strictEqual(channels, 4);

  let transparentRgbResidue = 0;
  for (let offset = 0; offset < image.data.length; offset += channels) {
    if (image.data[offset + 3] === 0 && (
      image.data[offset] !== 0 ||
      image.data[offset + 1] !== 0 ||
      image.data[offset + 2] !== 0
    )) {
      transparentRgbResidue += 1;
    }
  }
  assert.strictEqual(transparentRgbResidue, 0);

  for (let row = 0; row < rowCount; row += 1) {
    const required = row < V1_ROWS ? usedColumns[row] : COLS;
    for (let column = 0; column < COLS; column += 1) {
      let visiblePixels = 0;
      for (let y = row * CELL_H; y < (row + 1) * CELL_H; y += 1) {
        for (let x = column * CELL_W; x < (column + 1) * CELL_W; x += 1) {
          const offset = (y * width + x) * channels;
          if (image.data[offset + 3] !== 0) visiblePixels += 1;
        }
      }
      const isNeutralLookFrame = rowCount === V2_ROWS && row === 0 && column === 6;
      const shouldBeUsed = column < required || isNeutralLookFrame;
      if (shouldBeUsed) {
        assert(visiblePixels >= 100, `row ${row} column ${column} is empty`);
      } else {
        assert.strictEqual(visiblePixels, 0, `row ${row} column ${column} must be empty`);
      }
    }
  }
}

async function main() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(packageDir, { recursive: true });
  const rows = await buildRows();
  const v1Atlas = await composeAtlas(rows, V1_ROWS);
  const v2Atlas = await composeAtlas(rows, V2_ROWS);

  await validateAtlas(v1Atlas, V1_ROWS);
  await validateAtlas(v2Atlas, V2_ROWS);

  await sharp(v1Atlas).png({ compressionLevel: 9 }).toFile(
    path.join(outputDir, 'kairos-armadillo-upload.png'),
  );
  await sharp(v2Atlas).png({ compressionLevel: 9 }).toFile(
    path.join(outputDir, 'kairos-armadillo-v2.png'),
  );
  await sharp(v2Atlas).png({ compressionLevel: 9 }).toFile(
    path.join(packageDir, 'spritesheet.png'),
  );

  const preview = await makePreview(v2Atlas);
  fs.writeFileSync(path.join(outputDir, 'kairos-armadillo-preview.png'), preview);

  const manifest = {
    id: 'kairos-armadillo',
    displayName: 'Kairos Armadillo',
    description: 'The Kairos armadillo mascot, adapted as an animated Codex pet.',
    spriteVersionNumber: 2,
    spritesheetPath: 'spritesheet.png',
  };
  fs.writeFileSync(
    path.join(packageDir, 'pet.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const readme = `# Kairos Armadillo Codex pet\n\n` +
    `This package adapts the six Kairos community armadillo SVG illustrations into a Codex v2 pet atlas. ` +
    `The artwork is mechanically resized, mirrored, shifted, and rotated for animation; no replacement character art was generated.\n\n` +
    `## Files\n\n` +
    `- \`pet.json\`: Codex v2 pet manifest.\n` +
    `- \`spritesheet.png\`: lossless transparent 1536 x 2288 atlas.\n` +
    `- \`LICENSE\`: upstream Apache License 2.0.\n` +
    `- \`SOURCES.md\`: original artwork links and modification notice.\n\n` +
    `The look-direction rows use the closest available front, side, and back poses from the six supplied illustrations. ` +
    `They are functional approximations rather than sixteen separately drawn viewing angles.\n`;
  fs.writeFileSync(path.join(packageDir, 'README.md'), readme);

  const sources = `# Artwork sources\n\n` +
    `Original Kairos armadillo artwork from the kairos-io/community repository:\n\n` +
    [1, 2, 3, 4, 5, 6].map((index) => `- [Armadillo ${index}.svg](${sourceUrl(index)})`).join('\n') +
    `\n\n## Modification notice\n\n` +
    `The source SVGs were converted to transparent raster sprites, resized, positioned, mirrored, and slightly rotated to create animation frames and a Codex-compatible atlas.\n`;
  fs.writeFileSync(path.join(packageDir, 'SOURCES.md'), sources);
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(packageDir, 'LICENSE'));

  const uploadPath = path.join(outputDir, 'kairos-armadillo-upload.png');
  assert(fs.statSync(uploadPath).size <= 20 * 1024 * 1024, 'upload sheet exceeds 20 MiB');
  console.log('Built and validated Kairos Armadillo pet assets in dist/.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
