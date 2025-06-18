const fs = require('fs');
const path = require('path');
const { ufs } = require('unionfs');
const { Volume } = require('memfs');
const { patchFs } = require('fs-monkey');
const { isSea, getAsset } = require('node:sea');

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
     ufs.use(vol).use(ofs);
     patchFs(ufs);
   }
 } catch (err) {
   console.error('Error loading SEA assets: ', err);
 }
}