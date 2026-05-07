const fs = require('fs');
const path = 'src/app/features/machine-list/machine-list.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\.mecanica/g, "['mecanica']");
code = code.replace(/\.electronica/g, "['electronica']");
code = code.replace(/\.consumible/g, "['consumible']");

fs.writeFileSync(path, code);
