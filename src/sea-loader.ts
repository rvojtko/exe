import fs from 'fs';
import path from 'path';
import { IFS, ufs } from 'unionfs';
import { createFsFromVolume, Volume } from 'memfs';
import { isSea, getAsset } from 'node:sea';
const { patchFs } = require('fs-monkey');

//back up original 'fs'
const ofs = { ...fs };

if (isSea()) {
 try {
   const vol = new Volume();
   const assetManifest = JSON.parse(getAsset('sea-asset-manifest.json', 'utf8'));
   for (const filepath of assetManifest.assets) {
     vol.mkdirSync(path.posix.dirname(filepath), { recursive: true });
     vol.writeFileSync(filepath, Buffer.from(getAsset(filepath)));
   }

   if (Object.keys(vol.toJSON()).length > 0) {
     const mfs = createFsFromVolume(vol)
     ufs.use(mfs as unknown as IFS).use(ofs);
     patchFs(ufs);
   }
 } catch (err) {
   console.error('Error loading SEA assets: ', err);
 }
}