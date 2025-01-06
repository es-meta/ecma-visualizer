import { IDBPDatabase, openDB } from "idb";
import { Table } from "../App.tsx";

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

  public async getValue(tableName: Table, key: number | string) {
    if (this.db === null) return;
    const tx = this.db.transaction(tableName, "readonly");
    const store = tx.objectStore(tableName);
    return await store.get(key);
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
