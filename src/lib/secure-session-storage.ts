type Store = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
type Manifest = {
  kind: 'secure-session-v1';
  generation: string;
  count: number;
};
let sequence = 0;
function manifest(value: string | null): Manifest | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (
      parsed.kind === 'secure-session-v1' &&
      typeof parsed.generation === 'string' &&
      /^[\d-]+$/.test(parsed.generation) &&
      Number.isInteger(parsed.count) &&
      parsed.count > 0 &&
      parsed.count <= 512
    )
      return parsed;
  } catch {
    /* Legacy session values remain readable. */
  }
  return null;
}
const partKey = (key: string, meta: Manifest, index: number) =>
  `${key}.${meta.generation}.${index}`;

// Each chunk is <=1600 UTF-8 bytes even for non-ASCII characters. Publish the
// manifest last, so an interrupted write cannot replace a valid saved session.
export function createSecureSessionStorage(store: Store): Store {
  return {
    async getItem(key) {
      const raw = await store.getItem(key);
      const meta = manifest(raw);
      if (!meta) return raw;
      const parts: string[] = [];
      for (let i = 0; i < meta.count; i++) {
        const part = await store.getItem(partKey(key, meta, i));
        if (part === null) return null;
        parts.push(part);
      }
      return parts.join('');
    },
    async setItem(key, value) {
      const previous = manifest(await store.getItem(key));
      const meta: Manifest = {
        kind: 'secure-session-v1',
        generation: `${Date.now()}-${sequence++}`,
        count: Math.max(1, Math.ceil(value.length / 400)),
      };
      if (meta.count > 512)
        throw new Error('Session exceeds secure storage capacity');
      const written: string[] = [];
      try {
        for (let i = 0; i < meta.count; i++) {
          const chunkKey = partKey(key, meta, i);
          written.push(chunkKey);
          await store.setItem(chunkKey, value.slice(i * 400, (i + 1) * 400));
        }
        await store.setItem(key, JSON.stringify(meta));
      } catch (error) {
        await Promise.allSettled(
          written.map((chunkKey) => store.removeItem(chunkKey)),
        );
        throw error;
      }
      if (previous)
        await Promise.allSettled(
          Array.from({ length: previous.count }, (_, i) =>
            store.removeItem(partKey(key, previous, i)),
          ),
        );
    },
    async removeItem(key) {
      const previous = manifest(await store.getItem(key));
      await store.removeItem(key);
      if (previous)
        await Promise.allSettled(
          Array.from({ length: previous.count }, (_, i) =>
            store.removeItem(partKey(key, previous, i)),
          ),
        );
    },
  };
}
