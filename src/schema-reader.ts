import Realm from 'realm';

export type SchemaReaderOptions = {};

export class SchemaReader {
  public async read(path: string): Promise<Realm.ObjectSchema[]> {
    const db = await Realm.open({
      path
    });

    const schema = db.schema;

    db.close();

    return schema;
  }
}
