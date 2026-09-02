/* Build one self-contained tanda.html from /public.
   Use it when you want to publish TANDA as a Claude artifact, email it, or
   hand someone a single file that works offline with no server.

   Run:  node tools/build-single.js
   Out:  dist/tanda.html
*/
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pub = path.join(root, 'public');

let html = fs.readFileSync(path.join(pub, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(pub, 'css', 'styles.css'), 'utf8');

// inline the stylesheet
html = html.replace('<link rel="stylesheet" href="css/styles.css">', '<style>\n' + css + '\n</style>');

// inline every local script, in the order index.html lists them
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, src) => {
  const code = fs.readFileSync(path.join(pub, src), 'utf8');
  return '<script>\n/* ---- ' + src + ' ---- */\n' + code + '\n</script>';
});

// a single file has no server and no service worker
html = html.replace('<link rel="manifest" href="manifest.json">', '');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'tanda.html'), html);
console.log('wrote dist/tanda.html —', (html.length / 1024).toFixed(0) + ' KB');
