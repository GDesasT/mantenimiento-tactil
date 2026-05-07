const fs = require('fs');
const path = 'src/app/features/part-list/part-list.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("this.categoryService.loadCategories().subscribe();")) {
  code = code.replace(/async ngOnInit\(\) \{/, "async ngOnInit() {\n    this.categoryService.loadCategories().subscribe();\n");
  fs.writeFileSync(path, code);
}
