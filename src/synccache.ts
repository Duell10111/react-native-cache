export interface MMKVBackendInterface {
    set(key : string, value : string) : void
    getString(key: string): string | undefined;
    delete: (key: string) => void;
    getAllKeys() : string[]
    clearAll: () => void;
}

export interface ICacheOptions {
    // backend is expected to have the same static interface as react-native-mmkv
    backend: MMKVBackendInterface;
    namespace: string;
    policy: ICachePolicy;
    prunecallback? : ((keys : string[]) => void);
}

export interface ICachePolicy {
    maxEntries: number;
    stdTTL: number; // second
}

interface Entry {
    created : number
    value : string
}

export default class Cache {
    protected backend: MMKVBackendInterface;
    protected namespace: string;
    protected policy: ICachePolicy;
    protected prunecallback? : ((keys : string[]) => void);

    constructor(options: ICacheOptions) {
        this.namespace = options.namespace;
        this.backend = options.backend;
        this.policy = options.policy;
        this.prunecallback = options.prunecallback;
        let ttl = this.policy.stdTTL;
        if (!ttl || typeof(ttl) !== 'number') {
            ttl = 0;
        }
        this.policy.stdTTL = ttl;
    }

    public clearAll() {
        const keys = this.backend.getAllKeys();
        const namespaceKeys = keys.filter((key: string) => {
            return key.substr(0, this.namespace.length) === this.namespace;
        });

        namespaceKeys.forEach((key) => this.backend.delete(key));

        return this.setLRU([]);
    }

    public enforceLimits() {
        if (!this.policy.maxEntries) {
            return;
        }

        const lru = this.getLRU();
        const victimCount = Math.max(0, lru.length - this.policy.maxEntries);
        const victimList = lru.slice(0, victimCount);

        for (const victimKey of victimList) {
            this.remove(victimKey);
        }

        if(this.prunecallback !== undefined && victimList.length > 0){
            this.prunecallback(victimList);
        }

        const survivorList = lru.slice(victimCount);
        return this.setLRU(survivorList);
    }

    public getAll() {
        const keys = this.backend.getAllKeys();
        const namespaceKeys = keys.filter((key: string) => {
            return key.substr(0, this.namespace.length) === this.namespace;
        });

        const results = namespaceKeys.map((key) => [key, this.backend.getString(key)] );
        const allEntries: { [key: string]: any } = {};
        for (const [compositeKey, value] of results) {
            if(!compositeKey || !value) {
                continue
            }
            const key = this.fromCompositeKey(compositeKey);

            if (key === "_lru") {
                continue;
            }

            allEntries[key] = JSON.parse(value);
        }

        return allEntries;
    }

    public get(key: string): string | undefined {
        const value = this.peek(key);

        if (!value) {
            return;
        }

        this.refreshLRU(key);

        return value;
    }

    public peek(key: string): string | undefined {
        const compositeKey = this.makeCompositeKey(key);
        const entryJsonString = this.backend.getString(compositeKey);

        let entry : Entry | undefined;
        if (entryJsonString) {
            entry = JSON.parse(entryJsonString);
        }

        let value;
        if (entry) {
            value = entry.value;
            if (this.policy.stdTTL > 0) {
                const deadline = entry.created + this.policy.stdTTL * 1000;
                const now = Date.now();
                if (deadline < now) {
                    if(this.prunecallback) {
                        this.prunecallback([key])
                    }
                    this.remove(key);
                    value = undefined;
                }
            }
        }

        return value;
    }

    public remove(key: string) {
        const compositeKey = this.makeCompositeKey(key);
        this.backend.delete(compositeKey);

        return this.removeFromLRU(key);
    }

    public set(key: string, value: string) {
        const entry : Entry = {
            created: Date.now(),
            value
        };

        const compositeKey = this.makeCompositeKey(key);
        const entryString = JSON.stringify(entry);

        this.backend.set(compositeKey, entryString);
        this.refreshLRU(key);
        return this.enforceLimits();
    }

    protected addToLRU(key: string) {
        const lru = this.getLRU();

        lru.push(key);

        return this.setLRU(lru);
    }

    protected getLRU() {
        const lruString = this.backend.getString(this.getLRUKey());
        let lru: string[];

        if (!lruString) {
            lru = [];
        } else {
            lru = JSON.parse(lruString);
        }

        return lru;
    }

    protected getLRUKey() {
        return this.makeCompositeKey("_lru");
    }

    protected makeCompositeKey(key: string) {
        return `${this.namespace}:${key}`;
    }

    protected fromCompositeKey(compositeKey: string) {
        return compositeKey.slice(this.namespace.length + 1);
    }

    protected refreshLRU(key: string) {
        this.removeFromLRU(key);
        return this.addToLRU(key);
    }

    protected removeFromLRU(key: string) {
        const lru = this.getLRU();

        const newLRU = lru.filter((item: string) => {
            return item !== key;
        });

        return this.setLRU(newLRU);
    }

    protected setLRU(lru: string[]) {
        return this.backend.set(this.getLRUKey(), JSON.stringify(lru));
    }
}
