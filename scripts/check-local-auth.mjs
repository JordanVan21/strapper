// Opt-in integration check: creates fictional users in local Supabase only.
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const config = JSON.parse(
  execSync('npx supabase status -o json', { encoding: 'utf8' }),
);
const api = new URL(config.API_URL);
assert.ok(
  ['127.0.0.1', 'localhost'].includes(api.hostname),
  'Local API required',
);
const client = createClient(config.API_URL, config.ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const suffix = Date.now();
const email = `adult-${suffix}@example.test`;
for (const birthdate of [undefined, '2015-01-01', '2020-02-31']) {
  const { error } = await client.auth.signInWithOtp({
    email: `blocked-${suffix}-${birthdate ?? 'missing'}@example.test`,
    options: { data: birthdate ? { birthdate } : {} },
  });
  assert.ok(error, `Server should reject birthdate ${birthdate}`);
}
console.log('PASS: server rejects missing, under-18, and invalid birth dates');

async function codeFromInbox(subject) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const response = await fetch('http://127.0.0.1:54324/api/v1/messages');
    assert.ok(response.ok, 'Local inbox should respond');
    const inbox = await response.json();
    const message = inbox.messages.find(
      (item) =>
        item.Subject === subject && item.To.some((to) => to.Address === email),
    );
    if (message) {
      const detail = await fetch(
        `http://127.0.0.1:54324/api/v1/message/${message.ID}`,
      ).then((r) => r.json());
      const code = `${detail.Text} ${detail.HTML}`.match(/\b\d{6}\b/)?.[0];
      assert.ok(code, 'Email should contain a six-digit code');
      return code;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('No matching test email arrived');
}

const signup = await client.auth.signInWithOtp({
  email,
  options: { data: { birthdate: '1995-01-01' } },
});
assert.ifError(signup.error);
const code = await codeFromInbox('Your Strapper sign-up code');
assert.equal(signup.data.session, null, 'Signup must require confirmation');
const invalid = await client.auth.verifyOtp({
  email,
  token: 'not-a-code',
  type: 'email',
});
assert.ok(invalid.error, 'An invalid code must fail');
const verified = await client.auth.verifyOtp({
  email,
  token: code,
  type: 'email',
});
assert.ifError(verified.error);
assert.ok(verified.data.session, 'Valid signup code must create a session');
assert.ifError((await client.auth.signOut()).error);
assert.equal((await client.auth.getSession()).data.session, null);
console.log(
  'PASS: signup email, invalid-code rejection, verification, and sign-out',
);
await new Promise((resolve) => setTimeout(resolve, 1100));
assert.ifError(
  (
    await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
  ).error,
);
const loginCode = await codeFromInbox('Your Strapper sign-in code');
const login = await client.auth.verifyOtp({
  email,
  token: loginCode,
  type: 'email',
});
assert.ifError(login.error);
assert.ok(login.data.session);
assert.ifError((await client.auth.signOut()).error);
console.log('PASS: existing account signs in again using email code');
