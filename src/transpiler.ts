import ts from 'typescript';
import Realm from 'realm';

export type TranspilerOptions = {
  moduleName: string;
};

export class Transpiler {
  public transpile(
    schema: Realm.ObjectSchema[],
    options: TranspilerOptions
  ): string {
    const statement = schema.map(
      (schema): ts.TypeAliasDeclaration => {
        return this.toTypeAliasDeclaration(schema);
      }
    );

    const ast = ts.createModuleDeclaration(
      undefined,
      [ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
      ts.createLiteral(options.moduleName),
      ts.createModuleBlock(statement),
      undefined
    );
    const emptyFile = ts.createSourceFile('', '', ts.ScriptTarget.ES2015);

    const printer = ts.createPrinter();

    return printer.printNode(ts.EmitHint.Unspecified, ast, emptyFile);
  }

  private toTypeAliasDeclaration(
    schema: Realm.ObjectSchema
  ): ts.TypeAliasDeclaration {
    const props = Object.entries(schema.properties).map(
      ([name, type]): ts.PropertySignature => {
        return this.toPropertySignature(name, type);
      }
    );

    const typeAlias = ts.createTypeAliasDeclaration(
      undefined,
      undefined,
      schema.name,
      undefined,
      ts.createTypeLiteralNode(props)
    );

    return typeAlias;
  }

  private convertType(type: Realm.PropertyType): ts.TypeNode {
    if (type === 'bool') {
      return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    }
    if (type === 'string') {
      return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }
    if (['int', 'float', 'double'].includes(type)) {
      return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    }
    if (type === 'date') {
      return ts.createTypeReferenceNode('Date', []);
    }
    if (type === 'data') {
      return ts.createTypeReferenceNode('ArrayBuffer', []);
    }

    throw new Error(`unsupported type: ${type}`);
  }
  private toPropertySignature(
    name: string,
    type: Realm.PropertiesTypes[string]
  ): ts.PropertySignature {
    if (typeof type === 'string') {
      return ts.createPropertySignature(
        undefined,
        name,
        undefined,
        this.convertType(type),
        undefined
      );
    }

    const tsType = type.objectType
      ? ts.createTypeReferenceNode(type.objectType, [])
      : this.convertType(type.type);
    return ts.createPropertySignature(
      undefined,
      name,
      type.optional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined,
      type.type === 'list' ? ts.createArrayTypeNode(tsType) : tsType,
      undefined
    );
  }
}
