const fs = require('fs');
const path = 'src/app/features/part-list/part-list.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/const labels = {/g, "const labels: Record<string, string> = {");
code = code.replace(/const labels: \{[\s\S]*?\} = \{/g, "const labels: Record<string, string> = {");

code = code.replace(/const names = {/g, "const names: Record<string, string> = {");
code = code.replace(/const names: \{[\s\S]*?\} = \{/g, "const names: Record<string, string> = {");

code = code.replace(/const icons = {/g, "const icons: Record<string, string> = {");
code = code.replace(/const icons: \{[\s\S]*?\} = \{/g, "const icons: Record<string, string> = {");

code = code.replace(/const themes = {/g, "const themes: Record<string, string> = {");
code = code.replace(/const themes: \{[\s\S]*?\} = \{/g, "const themes: Record<string, string> = {");

fs.writeFileSync(path, code);
