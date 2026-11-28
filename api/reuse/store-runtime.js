import { JitsiMeetStore } from "../store.js";

const storeByExecutor = new WeakMap();

export function resolveStore(
    databaseExecutor,
    log,
    generatePassphrase,
    profileIdentity,
) {
    const existingStore = storeByExecutor.get(databaseExecutor);
    if (existingStore) {
        return existingStore;
    }
    const nextStore = new JitsiMeetStore({
        db: databaseExecutor,
        log,
        generatePassphrase,
        profileIdentity,
    });
    storeByExecutor.set(databaseExecutor, nextStore);
    return nextStore;
}
