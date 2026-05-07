const fs = require('fs');
const path = 'src/app/features/part-list/part-list.ts';
let code = fs.readFileSync(path, 'utf8');

// We know we want to inject CategoryService and Category into the imports if not present
if (!code.includes("import { CategoryService }")) {
  code = code.replace("import { PartService } from '../../core/services/part';", "import { PartService } from '../../core/services/part';\nimport { CategoryService } from '../../core/services/category';\nimport { Category } from '../../core/models/category.model';");
}

// Ensure Category imports
if(!code.includes("import { Category }")) {
  code = code.replace("import { CategoryService }", "import { CategoryService } from '../../core/services/category';\nimport { Category } from '../../core/models/category.model';\nimport { CategoryService }");
}

// Inject visual category map
const visualMapping = `
// Visual maps for categories
const CAT_VISUALS: Record<string, { icon: string, variant: string }> = {
  'mecanica': { icon: '⚙️', variant: 'primary' },
  'electronica': { icon: '⚡', variant: 'warning' },
  'consumible': { icon: '💡', variant: 'success' },
  'neumatica': { icon: '💨', variant: 'info' },
  'hidraulica': { icon: '💧', variant: 'primary' }
};
`;
code = code.replace(/@Component\({/, visualMapping + '\n@Component({');

// Update template: look for the "Filtros por categoría (Botones grandes)" section
// "<!-- Filtros por categoría (Botones grandes) -->"
const templateStart = code.indexOf('<!-- Filtros por categoría (Botones grandes) -->');
if (templateStart !== -1) {
  const templateEnd = code.indexOf('<!-- Filtros (Chips pequeños) -->', templateStart);
  if (templateEnd !== -1) {
    const newTemplate = `<!-- Filtros por categoría (Botones grandes) Dinámicos -->
              <div class="category-filters disable-scroll-bar">
                <app-touch-button
                  [variant]="selectedCategory === 'all' ? 'primary' : 'secondary'"
                  size="md"
                  icon="📦"
                  (clicked)="filterByCategory('all')"
                >
                  Todas ({{ getTotalParts() }})
                </app-touch-button>

                <ng-container *ngIf="categories$ | async as cats">
                  <app-touch-button
                    *ngFor="let cat of cats"
                    [variant]="selectedCategory === cat.name.toLowerCase() ? getCategoryVariant(cat.name) : 'secondary'"
                    size="md"
                    [icon]="getCategoryIconStr(cat.name)"
                    (clicked)="filterByCategory(cat.name.toLowerCase())"
                  >
                    {{ cat.name | titlecase }} ({{ getPartsByCategory(cat.name.toLowerCase()).length }})
                  </app-touch-button>
                  
                  <!-- Fallback if empty -->
                  <ng-container *ngIf="cats.length === 0">
                    <app-touch-button [variant]="selectedCategory === 'mecanica' ? 'primary' : 'secondary'" size="md" icon="⚙️" (clicked)="filterByCategory('mecanica')">Mecánica ({{ getPartsByCategory('mecanica').length }})</app-touch-button>
                    <app-touch-button [variant]="selectedCategory === 'electronica' ? 'warning' : 'secondary'" size="md" icon="⚡" (clicked)="filterByCategory('electronica')">Electrónica ({{ getPartsByCategory('electronica').length }})</app-touch-button>
                    <app-touch-button [variant]="selectedCategory === 'consumible' ? 'success' : 'secondary'" size="md" icon="💡" (clicked)="filterByCategory('consumible')">Consumibles ({{ getPartsByCategory('consumible').length }})</app-touch-button>
                  </ng-container>
                </ng-container>
              </div>
              `;
    code = code.slice(0, templateStart) + newTemplate + code.slice(templateEnd);
  }
}

// We need to inject the categories$ observable to the class
// Find: constructor(
const constructorStart = code.indexOf('constructor(');
if (constructorStart !== -1) {
  const categoriesProp = `categories$ = this.categoryService.categories$;\n\n  `;
  code = code.slice(0, constructorStart) + categoriesProp + code.slice(constructorStart);
  
  // Also add it to constructor arguments if not present
  if (!code.includes('private categoryService: CategoryService')) {
    code = code.replace(/constructor\(/, "constructor(\n    private categoryService: CategoryService,");
  }
}

// Add the visual helpers to the class if not present
if (!code.includes("getCategoryVariant(")) {
  const helpers = `
  getCategoryVariant(name: string): any {
    const s = name?.toLowerCase() || '';
    for(const key of Object.keys(CAT_VISUALS)) { if(s.includes(key)) return CAT_VISUALS[key].variant; }
    return 'primary';
  }
  getCategoryIconStr(name: string): string {
    const s = name?.toLowerCase() || '';
    for(const key of Object.keys(CAT_VISUALS)) { if(s.includes(key)) return CAT_VISUALS[key].icon; }
    return '🔖';
  }
`;
  // append before last brace
  const lastBrace = code.lastIndexOf('}');
  code = code.slice(0, lastBrace) + helpers + '\n}';
}

// Modify selectedCategory to accept string instead of strict types
code = code.replace(/selectedCategory: 'all' \| PartCategory = 'all';/g, "selectedCategory: string = 'all';");
code = code.replace(/this\.selectedCategory = categoryParam as 'all' \| PartCategory;/g, "this.selectedCategory = categoryParam || 'all';");

// Handle strict PartCategory typecasts
code = code.replace(/this\.selectedCategory as PartCategory/g, "this.selectedCategory");

fs.writeFileSync(path, code);
