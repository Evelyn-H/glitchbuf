const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace("'__HELP_MD__'", JSON.stringify(fs.readFileSync('HELP.md', 'utf8')));
html = html.replace("'__GLITCHSP_MD__'", JSON.stringify(fs.readFileSync('GLITCHSP.md', 'utf8')));
html = html.replace("'__EFFECTS_MD__'", JSON.stringify(fs.readFileSync('EFFECTS.md', 'utf8')));
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
fs.copyFileSync('style.css', 'dist/style.css');
