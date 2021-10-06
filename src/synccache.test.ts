import Cache from "../src/synccache";
import MemoryStore from "../src/syncMemoryStore";

const cache = new Cache({
    namespace: "test",
    policy: {
        stdTTL: 0,
        maxEntries: 1
    },
    backend: MemoryStore
});

function Sleep(milliseconds : number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

describe("cache", () => {
    it("can set and get entry", () => {
        cache.set("key1", "value1");
        const value = cache.get("key1");

        expect(value).toBe("value1");
    });

    it("can get a nonexistant item", () => {
        const value = cache.get("doesnotexist");

        expect(value).toBeUndefined();
    });

    it("can delete entry", () => {
        cache.set("key2", "value2");
        cache.remove("key2");

        const value = cache.get("key2");

        expect(value).toBeUndefined();
    });

    it("evicts entries in lastAccessed order", () => {
        cache.set("key1", "value1");
        cache.set("key2", "value2");

        const value1 = cache.get("key1");
        expect(value1).toBeUndefined();

        const value2 = cache.get("key2");
        expect(value2).toBe("value2");
    });

    it("can peek at a item", () => {
        cache.set("key1", "value1");
        const value = cache.peek("key1");

        expect(value).toBe("value1");
    });

    it("can set and get entry with colon in key", () => {
        cache.set("key2:key2", "value2");
        const value = cache.get("key2:key2");

        expect(value).toBe("value2");
    });

    it("can get all elements", () => {
        const entries = cache.getAll();

        expect(entries).not.toBeUndefined();
        expect(Object.keys(entries).length).toBe(1);

        const key2Entry = entries["key2:key2"];
        expect(key2Entry["value"]).toBe("value2");
    });

    it("can clear all elements", () => {
        cache.clearAll();

        const entries = cache.getAll();

        expect(Object.keys(entries).length).toBe(0);
    });

    it("can get notified when element got deleted", async () => {
        let lastprunekeys : string[] = []
        const testCache = new Cache({
            backend: MemoryStore,
            namespace: "ntest",
            policy: {
                maxEntries: 1,
                stdTTL: 1,
            },
            prunecallback: (keys) => lastprunekeys = keys
        })
        testCache.set("key", "value")
        const value = testCache.peek("key")

        expect(value).toBe("value")
        await Sleep(1000)
        expect(testCache.peek("key")).toBeUndefined()
        expect(lastprunekeys[0]).toBe("key")
    })
});
