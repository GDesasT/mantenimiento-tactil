const fs = require('fs');
const path = 'src/app/features/machine-list/machine-list.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/selectedArea: 'corte' \| 'costura' \| 'consumible' = 'costura';/g, "selectedArea: string = 'costura';");
code = code.replace(/this\.selectedArea =\n\s+\(this\.route\.snapshot\.params\['area'\] as 'corte' \| 'costura' \| 'consumible'\)\n\s+\|\| 'costura';/g, "this.selectedArea = this.route.snapshot.params['area'] || 'costura';");

// Fallback for cases where it's all on one line
code = code.replace(/this\.selectedArea =\s+\(this\.route\.snapshot\.params\['area'\] as 'corte' \| 'costura' \| 'consumible'\)\s+\|\|\s+'costura';/g, "this.selectedArea = this.route.snapshot.params['area'] || 'costura';");


// Replace getAreaTitle
const newGetAreaTitle = `
  getAreaTitle(): string {
    const s = this.selectedArea.toLowerCase();
    if(s.includes('corte')) return '✂️ ÁREA DE CORTE';
    if(s.includes('costura')) return '🧵 ÁREA DE COSTURA';
    if(s.includes('consumible')) return '💡 ÁREA DE CONSUMIBLES';
    if(s.includes('limpieza')) return '🧹 ÁREA DE LIMPIEZA';
    if(s.includes('herramienta')) return '🧰 ÁREA DE HERRAMIENTAS';
    return '🏭 ' + this.selectedArea.toUpperCase();
  }
`;
code = code.replace(/getAreaTitle\(\): string \{[\s\S]*?return this\.selectedArea === 'costura'[\s\S]*?ÁREA DE CORTE';\n  \}/g, newGetAreaTitle.trim());

// Replace getAreaLabel
const newGetAreaLabel = `
  getAreaLabel(): string {
    const s = this.selectedArea.toLowerCase();
    if(s.includes('corte')) return 'Corte Industrial';
    if(s.includes('costura')) return 'Costura Industrial';
    if(s.includes('consumible')) return 'Consumibles Industriales';
    if(s.includes('limpieza')) return 'Mantenimiento / Limpieza';
    if(s.includes('herramienta')) return 'Taller Mecánico';
    return this.selectedArea.charAt(0).toUpperCase() + this.selectedArea.slice(1);
  }
`;
code = code.replace(/getAreaLabel\(\): string \{[\s\S]*?return this\.selectedArea === 'costura'[\s\S]*?Corte Industrial';\n  \}/g, newGetAreaLabel.trim());

// Replace getAreaIcon
const newGetAreaIcon = `
  getAreaIcon(): string {
    const s = this.selectedArea.toLowerCase();
    if(s.includes('corte')) return '✂️';
    if(s.includes('costura')) return '🧵';
    if(s.includes('consumible')) return '💡';
    if(s.includes('limpieza')) return '🧹';
    if(s.includes('herramienta')) return '🧰';
    return '📦';
  }
`;
code = code.replace(/getAreaIcon\(\): string \{[\s\S]*?return this\.selectedArea === 'costura'[^}]*?✂️';\n  \}/g, newGetAreaIcon.trim());

fs.writeFileSync(path, code);
