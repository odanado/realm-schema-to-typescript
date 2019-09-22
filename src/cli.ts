import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { SchemaReader } from './schema-reader';
import { Transpiler } from './transpiler';

const mkdir = promisify(fs.mkdir).bind(fs);
const writeFile = promisify(fs.writeFile).bind(fs);
const exists = promisify(fs.exists).bind(fs);

type CliOptions = {
  input: string;
  directory: string;
  moduleName: string;
};

function parse(): CliOptions {
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

  const options = parse();

  const schema = await schemaReader.read(options.input);
  const code = transpiler.transpile(schema, { moduleName: options.moduleName });

  if (!(await exists(options.directory))) {
    await mkdir(options.directory, { recursive: true });
  }
  const filePath = path.join(options.directory, `${options.moduleName}.ts`);

  await writeFile(filePath, code);
}

main();
