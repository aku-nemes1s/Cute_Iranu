#!/usr/bin/env node
/**
 * generate-manifests.js
 *
 * Run this script locally (Node.js) to auto-generate all manifest.json files
 * from your actual image folders. Run once before pushing to GitHub.
 *
 * Usage:
 *   node generate-manifests.js
 *
 * It will:
 *   1. Scan ./images/ for subdirectories
 *   2. List all image files (.jpg, .jpeg, .png, .gif, .webp, .avif) in each
 *   3. Write ./images/FOLDER/manifest.json
 *   4. Write ./manifest.json with all folder names
 */

const fs   = require('fs');
const path = require('path');

const IMAGES_DIR     = path.join(__dirname, 'images');
const ROOT_MANIFEST  = path.join(__dirname, 'manifest.json');
const IMAGE_EXTS     = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

function isImageFile(filename) {
  return IMAGE_EXTS.has(path.extname(filename).toLowerCase());
}

function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌  ./images/ directory not found. Create it and add your photo folders.');
    process.exit(1);
  }

  const entries = fs.readdirSync(IMAGES_DIR, { withFileTypes: true });
  const folderNames = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();

  if (folderNames.length === 0) {
    console.warn('⚠️  No subdirectories found inside ./images/');
  }

  folderNames.forEach(folder => {
    const folderPath = path.join(IMAGES_DIR, folder);
    const files = fs.readdirSync(folderPath)
      .filter(isImageFile)
      .sort();                      // alphabetical / date-sortable names work best

    const manifest = { images: files };
    const manifestPath = path.join(folderPath, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅  ${folder}/manifest.json — ${files.length} image(s)`);
  });

  // Root manifest
  const rootManifest = { folders: folderNames };
  fs.writeFileSync(ROOT_MANIFEST, JSON.stringify(rootManifest, null, 2));
  console.log(`\n📦  manifest.json — ${folderNames.length} folder(s): ${folderNames.join(', ')}`);
  console.log('\n🚀  Done! Commit everything and push to GitHub.');
}

main();
