// setup-project.js - 20 lines that'll save you hours
import { promises as fs } from 'fs';
import path from 'path';

const [projectName, dbType] = process.argv.slice(2);

if (!projectName) {
  console.error('Usage: node setup-project.js <name> [postgres|mongo]');
  process.exit(1);
}

async function scaffold() {
  const rootDir = path.join(process.cwd(), projectName);
  
  // 1. Create folder structure (async, in parallel)
  await Promise.all([
    fs.mkdir(path.join(rootDir, 'src'), { recursive: true }),
    fs.mkdir(path.join(rootDir, 'prisma'), { recursive: true }),
  ]);
  
  // 2. Write package.json (stream for practice)
  const pkgJson = {
    name: projectName,
    type: 'module',
    dependencies: {
      '@prisma/client': '^5.0.0',
    //   'pg': pg (dbType === 'postgres') ? '^8.11.0' : undefined,
    }
  };
  
  await fs.writeFile(
    path.join(rootDir, 'package.json'),
    JSON.stringify(pkgJson, null, 2)
  );
  
  // 3. Create .env with DB_URL placeholder
  await fs.writeFile(
    path.join(rootDir, '.env'),
    `DATABASE_URL="${dbType === 'postgres' ? 'postgresql://user:pass@localhost:5432/' : 'mongodb://localhost:27017'}/${projectName}"`
  );
  
  console.log(`✅ Project ${projectName} ready at ${rootDir}`);
  console.log(`   cd ${projectName} && npm install`);
}

scaffold().catch(console.error);