import { IDBPDatabase, openDB } from "idb";
import {
  EcIdToAlgoName,
  EcIdToFunc,
  FuncIdToFunc,
  FuncToEcId,
  FuncToFuncId,
  FuncToSdo,
  NodeIdToProgId,
  NodeIdToTest262,
  ProgIdToProg,
  StepToNodeId,
  TestIdToTest262,
} from "../../types/maps.ts";

export type Table = keyof TableTypes;

type TableTypes = {
  "step-to-nodeId": StepToNodeId;
  "nodeId-to-progId": NodeIdToProgId;
  "progId-to-prog": ProgIdToProg;
  "nodeId-to-test262": NodeIdToTest262;
  "func-to-ecId": FuncToEcId;
  "ecId-to-func": EcIdToFunc;
  "funcId-to-func": FuncIdToFunc;
  "func-to-funcId": FuncToFuncId;
  "ecId-to-algo-name": EcIdToAlgoName;
  "func-to-sdo": FuncToSdo;
  "testId-to-test262": TestIdToTest262;
};

class IndexedDb {
  private database: string;
  private db: IDBPDatabase | null;

  constructor(database: string) {
    this.database = database;
    this.db = null;
  }

  public async createObjectStore(tableNames: Table[]) {
    this.db = await openDB(this.database, 1, {
      upgrade(db: IDBPDatabase) {
        for (const tableName of tableNames) {
          if (db.objectStoreNames.contains(tableName)) {
            continue;
          }
          db.createObjectStore(tableName);
        }
      },
    });
  }

  public async getValue<K extends Table>(
    tableName: K,
    key: number | string,
  ): Promise<TableTypes[K][keyof TableTypes[K]] | null> {
    if (this.db === null) throw new Error("[getValue] db is null");

    const tx = this.db.transaction(tableName, "readonly");
    const store = tx.objectStore(tableName);
    const val = await store.get(key);

    if (val === undefined) {
      console.error(`${key} not found in ${tableName}`);
      return null;
    }

    return val;
  }

  public async getAllValue(tableName: Table) {
    if (this.db === null) return;
    const tx = this.db.transaction(tableName, "readonly");
    const store = tx.objectStore(tableName);
    return await store.getAll();
  }

  public async saveJson(tableName: Table, url: string) {
    const response = await fetch(chrome.runtime.getURL(url));
    if (!response.ok) {
      throw new Error("Failed to fetch JSON data");
    }
    const data: Record<string, object> = await response.json();

    const set = Object.keys(data).reduce<{ key: string; value: object }[]>(
      (acc, key) => {
        acc.push({ key: key, value: data[key] });
        return acc;
      },
      [],
    );

    await this.putValue(tableName, set);
  }

  public async putValue(
    tableName: string,
    set: { value: object; key: string | number }[],
  ) {
    if (this.db === null) return;

    const tx = this.db.transaction(tableName, "readwrite");
    const store = tx.objectStore(tableName);

    const promises = set.map(({ value, key }) => store.put(value, key));
    await Promise.all(promises);
    await tx.done;
  }

  public async deleteValue(tableName: Table, id: number | string) {
    if (this.db === null) return;
    const tx = this.db.transaction(tableName, "readwrite");
    const store = tx.objectStore(tableName);
    const result = await store.get(id);
    if (!result) {
      return result;
    }
    await store.delete(id);
    return id;
  }

  public async deleteAllValue(tableName: Table) {
    if (this.db === null) return;
    const tx = this.db.transaction(tableName, "readwrite");
    const store = tx.objectStore(tableName);
    if (store) {
      await store.clear();
    }
    return;
  }
}

export default IndexedDb;
