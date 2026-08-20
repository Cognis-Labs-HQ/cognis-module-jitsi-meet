import test from 'node:test';
import assert from 'node:assert/strict';
import { createModuleConfigResolver } from '../module-preferences.js';

test('module configuration is read exclusively from Cognis preferences', async () => {
  const reads = [];
  const resolveModuleConfig = createModuleConfigResolver({
    async get(accountId, key) {
      reads.push({ accountId, key });
      return JSON.stringify({
        instanceUrl: 'https://broken.example.test/path',
        meetingPrefix: ' Team Room ',
      });
    },
  });

  assert.deepEqual(await resolveModuleConfig('admin-1'), {
    instanceUrl: 'https://broken.example.test/path',
    meetingPrefix: 'team-room',
  });
  assert.deepEqual(reads, [
    { accountId: 'admin-1', key: 'module:jitsi-meet' },
  ]);
});

test('invalid stored module preferences fail closed', async () => {
  const errors = [];
  const resolveModuleConfig = createModuleConfigResolver(
    { get: async () => '{invalid' },
    (level, message, metadata) => errors.push({ level, message, metadata }),
  );

  assert.deepEqual(await resolveModuleConfig('admin-1'), {
    instanceUrl: '',
    meetingPrefix: '',
  });
  assert.equal(errors[0].level, 'error');
  assert.equal(errors[0].metadata.operation, 'parse_module_preferences');
});
