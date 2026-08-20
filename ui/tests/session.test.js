import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureSessionId } from '../session.js';

function replaceGlobal(name, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value,
  });
  return () => {
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor);
    } else {
      delete globalThis[name];
    }
  };
}

test('meeting sessions require cryptographically secure identifiers', () => {
  const values = new Map();
  const restoreStorage = replaceGlobal('localStorage', {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  });
  const restoreCrypto = replaceGlobal('crypto', undefined);

  try {
    assert.throws(
      () => ensureSessionId(),
      /Web Crypto is required to create a meeting session/,
    );
  } finally {
    restoreCrypto();
    restoreStorage();
  }
});

test('meeting sessions persist Web Crypto UUIDs', () => {
  const values = new Map();
  const restoreStorage = replaceGlobal('localStorage', {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  });
  const restoreCrypto = replaceGlobal('crypto', {
    getRandomValues: (bytes) => bytes,
    randomUUID: () => 'secure-session-id',
  });

  try {
    assert.equal(ensureSessionId(), 'secure-session-id');
    assert.equal(ensureSessionId(), 'secure-session-id');
  } finally {
    restoreCrypto();
    restoreStorage();
  }
});
