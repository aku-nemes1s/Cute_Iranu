# GALLERY — GitHub Pages Photo Gallery

A cinematic dark masonry gallery with futuristic slideshow. No server needed — runs purely on GitHub Pages.

## File Structure

```
gallery/
├── index.html
├── manifest.json              ← lists all folder names
├── css/
│   └── style.css
├── js/
│   └── gallery.js
├── generate-manifests.js      ← run locally to build manifests
└── images/
    ├── folder1/
    │   ├── manifest.json      ← lists image filenames in this folder
    │   ├── photo1.jpg
    │   ├── photo2.jpg
    │   └── ...
    ├── folder2/
    │   ├── manifest.json
    │   └── ...
    └── folder3/
        ├── manifest.json
        └── ...
```

## Setup (one time)

1. Add your photo folders inside `images/`
   - Each subfolder = one gallery card on the masonry grid
   - Any image format works: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`

2. Run the manifest generator **locally** (requires Node.js):
   ```bash
   node generate-manifests.js
   ```
   This auto-creates `manifest.json` inside each folder AND the root `manifest.json`.

3. Commit and push everything to GitHub. Done.

## Adding a new folder later

1. Drop your new folder inside `images/`
2. Run `node generate-manifests.js` again
3. Commit & push

## Customization

- **Folder order** — edit `manifest.json` at the root to reorder folder names
- **Cover image** — the first image in each folder's manifest is used as the cover
- **Card proportions** — tweak the `nth-child` rules in `style.css` under "FOLDER CARDS"
- **Autoplay speed** — change `3500` (ms) in `gallery.js` → `setInterval(nextSlide, 3500)`
