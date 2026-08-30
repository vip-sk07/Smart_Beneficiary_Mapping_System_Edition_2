import { openDB } from "idb";

const DB_NAME = "sbms-offline-db";
const STORE_NAME = "offline-applications";

export async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // Key path is autoincrement ID or we can use a custom string id
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                    autoIncrement: true,
                });
                store.createIndex("schemeId", "schemeId");
                store.createIndex("userId", "userId");
            }
        },
    });
}

export interface OfflineApplication {
    id?: number;
    schemeId: string;
    schemeTitle: string;
    userId: string;
    missingDocs: string;
    timestamp: number;
    status: "pending" | "failed";
}

export async function saveOfflineApplication(app: Omit<OfflineApplication, "id" | "timestamp" | "status">) {
    const db = await initDB();
    const data: OfflineApplication = {
        ...app,
        timestamp: Date.now(),
        status: "pending",
    };
    return db.add(STORE_NAME, data);
}

export async function getOfflineApplications(userId: string): Promise<OfflineApplication[]> {
    const db = await initDB();
    // In IDB we can query by userId index
    return db.getAllFromIndex(STORE_NAME, "userId", userId);
}

export async function removeOfflineApplication(id: number) {
    const db = await initDB();
    return db.delete(STORE_NAME, id);
}

export async function updateOfflineApplicationStatus(id: number, status: "pending" | "failed") {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const app = await store.get(id);
    if (app) {
        app.status = status;
        await store.put(app);
    }
    await tx.done;
}
