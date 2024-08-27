import { MemoryCache } from 'memory-cache-node';

const itemsExpirationCheckIntervalInSecs = 600;
const maxItemCount = 1_000_000;
const cache = new MemoryCache<string, string>(itemsExpirationCheckIntervalInSecs, maxItemCount);

export { cache };
