// Render a list of frames as PNG stills from one bundle: node scripts/stills.mjs 0 120 240 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(import.meta.dirname, '..');
const frames = process.argv.slice(2).map(Number);
const outDir = path.join(root, 'out', 'stills');
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const browserExecutable = 'C:/Users/muhsi/Downloads/edits/toy-kingdom/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe';
const composition = await selectComposition({serveUrl, id: 'OneStop', inputProps: {mute: true}, browserExecutable});
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame, inputProps: {mute: true}, browserExecutable});
  console.log('rendered', frame);
}
