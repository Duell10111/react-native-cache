import { MMKVBackendInterface } from "./synccache";

const memoryStore: any = {};

export default {
    set(key, value) {
        memoryStore[key] = value
    },
    delete(key) {
        delete memoryStore[key]
    },
    getString(key) {
        return memoryStore[key]
    },
    getAllKeys() {
        return Object.keys(memoryStore);
    },
    clearAll() {
        this.getAllKeys().forEach((key) => this.delete(key))
    }
} as MMKVBackendInterface