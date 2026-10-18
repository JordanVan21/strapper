import test from 'node:test';
import assert from 'node:assert/strict';
import { createSecureSessionStorage } from '../src/lib/secure-session-storage.ts';

function fixture() {
  const data = new Map();
  let writes = 0;
  let failAt = Infinity;
  const storage = createSecureSessionStorage({
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      if (++writes === failAt) throw new Error('Device storage failed');
      assert.ok(Buffer.byteLength(value, 'utf8') < 2048);
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
  });
  return {
    data,
    storage,
    failAfter(count) {
      failAt = writes + count;
    },
  };
}
test('large Unicode sessions round-trip within per-item secure store limits', async () => {
  const { storage, data } = fixture();
  const value = JSON.stringify({ token: 'abc😀🏳️‍🌈'.repeat(1000) });
  await storage.setItem('session', value);
  assert.equal(await storage.getItem('session'), value);
  assert.ok(data.size > 2);
  await storage.removeItem('session');
  assert.equal(data.size, 0);
});
test('failed update preserves the previous session and cleans partial writes', async () => {
  const f = fixture();
  await f.storage.setItem('session', 'old'.repeat(1000));
  const before = new Map(f.data);
  f.failAfter(2);
  await assert.rejects(f.storage.setItem('session', 'new'.repeat(1000)));
  assert.equal(await f.storage.getItem('session'), 'old'.repeat(1000));
  assert.deepEqual(f.data, before);
});
test('replacement removes previous chunks and legacy sessions migrate', async () => {
  const { storage, data } = fixture();
  data.set('session', '{"access_token":"legacy"}');
  assert.equal(await storage.getItem('session'), '{"access_token":"legacy"}');
  await storage.setItem('session', 'x'.repeat(2000));
  await storage.setItem('session', 'short');
  assert.equal(await storage.getItem('session'), 'short');
  assert.equal(data.size, 2);
});
test('incomplete sessions are never returned', async () => {
  const { storage, data } = fixture();
  await storage.setItem('session', 'x'.repeat(1000));
  data.delete([...data.keys()].find((key) => key !== 'session'));
  assert.equal(await storage.getItem('session'), null);
});
