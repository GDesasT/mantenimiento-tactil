const fs = require('fs');
const path = 'src/app/core/models/part.model.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/category: 'mecanica' \| 'electronica' \| 'consumible';/g, "category: string;");
code = code.replace(/export type PartCategory = 'mecanica' \| 'electronica' \| 'consumible';/g, "export type PartCategory = string;");

fs.writeFileSync(path, code);
