const fs = require('fs');
const path = 'src/app/features/part-list/part-list.ts';
let code = fs.readFileSync(path, 'utf8');

// remove categories$ class val initialization
code = code.replace(/categories\$ = this\.categoryService\.categories\$;/g, "categories$!: import('rxjs').Observable<Category[]>;");

// put it in constructor
code = code.replace(/constructor\(\n    private categoryService: CategoryService,/g, "constructor(\n    private categoryService: CategoryService,");

// but we still need to initialize it. we can do it in constructor body.
const constructEnd = code.indexOf('{', code.indexOf('constructor('));
if (constructEnd !== -1) {
  code = code.slice(0, constructEnd + 1) + "\n    this.categories$ = this.categoryService.categories$;" + code.slice(constructEnd + 1);
}

fs.writeFileSync(path, code);
