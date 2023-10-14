import AsyncIndexedDB from "./IndexeddbWrapper";

export const Store = {
  profiles: "profiles",
  chats: "chats",
};
const schema = (db: IDBDatabase) => {
  db.createObjectStore(Store.profiles, {
    keyPath: "id",
    autoIncrement: true,
  });

  const chatStore = db.createObjectStore(Store.chats, {
    keyPath: "id",
    autoIncrement: true,
  });
  chatStore.createIndex("threadIndex", "thread", { unique: false });
};

const db = new AsyncIndexedDB("user", schema, 1);

export const initDB = async () => await db.open();
export default db;
