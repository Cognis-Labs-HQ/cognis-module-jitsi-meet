import { JitsiMeetStore } from "../store.js";

const storeByExecutor = new WeakMap();

export function resolveStore(
    dbExecutor,
    log,
    generatePassphrase,
    profileIdentity,
) {
    const existingStore = storeByExecutor.get(dbExecutor);
    if (existingStore) {
        return existingStore;
    }
    const nextStore = new JitsiMeetStore({
        db: dbExecutor,
        log,
        generatePassphrase,
        profileIdentity,
    });
    storeByExecutor.set(dbExecutor, nextStore);
    return nextStore;
}
