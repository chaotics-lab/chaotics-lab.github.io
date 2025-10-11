import fs from 'fs';
import path from 'path';

// Make this path relative to the project root, not /src
const projectsDir = path.resolve(process.cwd(), 'public/projects');
const indexFile = path.resolve(projectsDir, 'projects.json');

if (!fs.existsSync(projectsDir)) {
  console.error(`Directory not found: ${projectsDir}`);
  process.exit(1);
}

const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));

fs.writeFileSync(indexFile, JSON.stringify(files, null, 2));
console.log(`Generated projects.json with ${files.length} files.`);
