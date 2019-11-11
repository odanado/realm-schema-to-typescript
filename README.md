# realm-schema-to-typescript
![](https://github.com/odanado/realm-schema-to-typescript/workflows/Node%20CI/badge.svg)

Generate a code of TypeScript from [Realm](https://realm.io/) 

## Installation and Usage

### From CLI
```bash
$ npx realm-schema-to-typescript --input /path/to/file.realm --directory generated --moduleName module
```

### From TypeScript
```ts
import { SchemaReader } from './schema-reader';
import { Transpiler } from './transpiler';


const schemaReader = new SchemaReader();
const transpiler = new Transpiler();

const schema = await schemaReader.read('/path/to/file.realm');
const code = transpiler.transpile(schema, { moduleName: 'module' });

console.log(code);
```
