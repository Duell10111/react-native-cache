# @duell10111/react-native-cache

[![npm version](https://badge.fury.io/js/@duell10111%2Freact-native-cache.svg)](https://badge.fury.io/js/@duell10111%2Freact-native-cache)
[![Tests](https://github.com/Duell10111/react-native-cache/actions/workflows/test-workflow.yml/badge.svg)](https://github.com/Duell10111/react-native-cache/actions/workflows/test-workflow.yml)

LRU cache built on top of the [React Native communities' AsyncStorage v2](https://github.com/react-native-community/async-storage/tree/master) (or included MemoryStore) and automatic pruning of least recently used items.

Based on timfpark's version.

Additionally a sync version is included to use it on top of the [React Native MMKV](https://github.com/mrousavy/react-native-mmkv) package.

## Installation

*   Run the following command.

```shell
npm install --save @duell10111/react-native-cache
or
yarn add @duell10111/react-native-cache
```

*   Import the library.

```javascript
import { Cache } from "@duell10111/react-native-cache"; //Async version
```

```javascript
import { SyncCache } from "@duell10111/react-native-cache"; //Sync version
```

## Usage

You initialize a cache using the following.

```javascript
const cache = new Cache({
    namespace: "myapp",
    policy: {
        maxEntries: 50000, // if unspecified, it can have unlimited entries
        stdTTL: 0 // the standard ttl as number in seconds, default: 0 (unlimited)
    },
    backend: AsyncStorage,
    prunecallback: (keys) => {console.log(keys)} //prunecallback called if a key gets removed
});
```

Multiple caches can be mantained in an application by instantiating caches with different namespaces.

### Setting a key's value in the cache

```javascript
await cache.set("hello", "world");
// key 'hello' is now set to 'world' in namespace 'myapp'
```

### Get an item in the cache

```javascript
const value = await cache.get("key1");
console.log(value);
// 'hello'
});
```

Getting an item from the cache also moves it to the end of the LRU list: it will be evicted from the cache last.

### Delete an item from the cache

```javascript
await cache.remove("key1");
// 'key1' is no more.
```

### Peeking at an item in the cache

You can also peek at an item in the cache without updating its position in the LRU list:

```javascript
const value = await cache.peek("key1");
// value is retrieved but LRU value is unchanged.
```

### Getting all of the elements in the cache

You can look at all of the elements in the cache without updating its position in the LRU list:

```javascript
const entries = await cache.getAll();
console.dir(entries);
// {
//     "key1": { "value": 42 }
//     "key2": { "value": 2 }
//     ...
// }
```

### Clearing all of the elements in the cache

You can also clear all of the items in the cache with:

```javascript
await cache.clearAll();
```

For more usage examples, see the tests.
