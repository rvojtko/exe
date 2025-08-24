import './sea-loader';

import fs from 'fs';
import path from 'path';
import { ufs } from 'unionfs';
import { Volume } from 'memfs';
import { patchFs } from 'fs-monkey';
import { isSea, getAsset } from 'node:sea';

interface AssetManifest {
  assets: string[];
}

// back up original 'fs'
const ofs: typeof fs = { ...fs };

if (isSea()) {
  try {
    const vol = new Volume();

    // Read and parse the SEA asset manifest
    const manifestRaw = getAsset('sea-asset-manifest.json', 'utf8') as string;
    const assetManifest: AssetManifest = JSON.parse(manifestRaw);

    for (const filepath of assetManifest.assets) {
      // Ensure directory exists in the in-memory volume
      vol.mkdirSync(path.posix.dirname(filepath), { recursive: true });

      // Load asset
      const buffer = Buffer.from(getAsset(filepath));

      // Write asset into the in-memory volume
      vol.writeFileSync(filepath, buffer);
    }

    // If there are any files in the virtual volume, patch fs
    if (Object.keys(vol.toJSON()).length > 0) {
      ufs.use(vol).use(ofs);
      patchFs(ufs);
      console.log('[SEA] assets mounted');
    }
  } catch (err) {
    console.error('Error loading SEA assets:', err);
  }
}
