// Syntax-check the actual bundled JavaScript without executing browser code.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'FRAME.html'), 'utf8');
const blocks = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if (!blocks.length) throw new Error('No application JavaScript found');
for (const [index, block] of blocks.entries()) new vm.Script(block[1], {filename: `FRAME-inline-${index}.js`});
console.log(`PASS: ${blocks.length} embedded JavaScript block(s) parsed`);
