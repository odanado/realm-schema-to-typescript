import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { SchemaReader } from './schema-reader';
import { Transpiler } from './transpiler';

const mkdir = promisify(fs.mkdir).bind(fs);
const writeFile = promisify(fs.writeFile).bind(fs);
const exists = promisify(fs.exists).bind(fs);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function parse() {
  const argv = yargs
    .option('input', {
      alias: 'i',
      demandOption: true,
      type: 'string'
    })
    .option('directory', {
      alias: 'd',
      demandOption: true,
      type: 'string'
    })
    .option('moduleName', {
      alias: 'm',
      demandOption: true,
      type: 'string'
    }).argv;

  return argv;
}

async function main(): Promise<void> {
  const schemaReader = new SchemaReader();
  const transpiler = new Transpiler();

  const argv = parse();

  const schema = await schemaReader.read(argv.input);
  const code = transpiler.transpile(schema, { moduleName: argv.moduleName });

  if (!(await exists(argv.directory))) {
    await mkdir(argv.directory, { recursive: true });
  }
  const filePath = path.join(argv.directory, `${argv.moduleName}.ts`);

  await writeFile(filePath, code);
}

main();
