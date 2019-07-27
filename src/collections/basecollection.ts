import { ShardClient } from '../client';


/**
 * Basic Collection, the most basic
 * @category Collections
 */
export class BaseCollection<K, V> extends Map<K, V > {
  defaultKey: null | string;

  constructor(
    iterable?: Array<V> | Array<[K, V]> | IterableIterator<V> | IterableIterator<[K, V]> | Map<K, V> | null,
    defaultKey: null | string = 'id',
  ) {
    if (iterable instanceof Map) {
      super(iterable.entries());
    } else {
      if (defaultKey !== null) {
        super();

        if (iterable) {
          for (let value of iterable) {
            const key = (<any> value)[defaultKey];
            this.set(<K> key, <V> value);
          }
        }
      } else {
        super(<any> iterable);
      }
    }
    this.defaultKey = defaultKey;

    Object.defineProperty(this, 'defaultKey', {enumerable: false});
  }

  get length(): number {
    return this.size;
  }

  clone(): BaseCollection<K, V> {
    return new BaseCollection<K, V>(this.entries());
  }

  every(func: any): boolean {
    return this.toArray().every(func);
  }

  filter(key: K | Function, value?: V): Array<V> {
    let func: Function;
    if (typeof(key) === 'function') {
      func = key;
    } else {
      func = (v: V, k?: K): boolean => {
        return this.get(<K> key) === value;
      };
    }
    const map: Array<V> = [];
    for (let [k, v] of this) {
      if (func(v, k)) {
        map.push(v);
      }
    }
    return map;
  }

  find(func: Function): undefined | V {
    for (let [key, value] of this) {
      if (func(value, key)) {
        return value;
      }
    }
  }

  first(): undefined | V {
    return this.values().next().value;
  }

  map(func: Function): Array<any> {
    const map: Array<V> = [];
    for (let [key, value] of this) {
      map.push(func(value, key));
    }
    return map;
  }

  reduce(cb: any, initialValue?: any): any {
    return this.toArray().reduce(cb, initialValue);
  }

  some(func: Function): boolean {
    for (let [key, value] of this) {
      if (func(value, key)) {
        return true;
      }
    }
    return false;
  }

  toArray(): Array<V> {
    return Array.from(this.values());
  }

  toJSON(): Array<V> {
    return this.toArray();
  }

  toString(): string {
    return `BaseCollection (${this.size} items)`;
  }
}


export interface BaseClientCollectionOptions {
  enabled?: boolean,
}

/**
 * Basic Client Collection, the ShardClient instance is attached to this
 * @category Collections
 */
export class BaseClientCollection<K, V> extends BaseCollection<K, V> {
  client: ShardClient;
  enabled: boolean;

  constructor(
    client: ShardClient,
    options: BaseClientCollectionOptions = {},
  ) {
    super();

    this.client = client;
    this.enabled = !!(options.enabled || options.enabled === undefined);

    Object.defineProperties(this, {
      client: {enumerable: false, writable: false},
      enabled: {configurable: true, writable: false},
    });
  }

  setEnabled(value: boolean) {
    Object.defineProperty(this, 'enabled', {value});
  }

  clear(shardId?: number): void {
    super.clear();
  }
}