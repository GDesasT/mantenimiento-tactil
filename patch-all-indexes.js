const fs = require('fs');

const filesToPatch = [
  'src/app/features/add-part/add-part.ts',
  'src/app/features/edit-part/edit-part.ts',
  'src/app/features/global-search/global-search-new.ts',
  'src/app/features/global-search/global-search-old.ts',
  'src/app/features/global-search/global-search.ts'
];

for(const path of filesToPatch) {
  if(!fs.existsSync(path)) continue;
  let code = fs.readFileSync(path, 'utf8');

  code = code.replace(/const labels = {/g, "const labels: Record<string, string> = {");
  code = code.replace(/const labels: \{[\s\S]*?\} = \{/g, "const labels: Record<string, string> = {");

  code = code.replace(/const names = {/g, "const names: Record<string, string> = {");
  code = code.replace(/const names: \{[\s\S]*?\} = \{/g, "const names: Record<string, string> = {");

  code = code.replace(/const icons = {/g, "const icons: Record<string, string> = {");
  code = code.replace(/const icons: \{[\s\S]*?\} = \{/g, "const icons: Record<string, string> = {");

  code = code.replace(/const descriptions = {/g, "const descriptions: Record<string, string> = {");
  code = code.replace(/const descriptions: \{[\s\S]*?\} = \{/g, "const descriptions: Record<string, string> = {");

  fs.writeFileSync(path, code);
}
