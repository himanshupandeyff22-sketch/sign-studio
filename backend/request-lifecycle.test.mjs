import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequestLifecycle} from '../web/request-lifecycle.mjs';

test('resubmission aborts old work and only the newest operation can commit or unlock', async () => {
  const requests = createRequestLifecycle();
  const first = requests.start();
  let release;
  const download = new Promise(resolve => { release = resolve; });
  const committed = [];
  const oldCompletion = download.then(() => {
    if (requests.isCurrent(first)) committed.push('obsolete queue');
    return requests.finish(first);
  });
  const second = requests.start();
  assert.equal(first.signal.aborted, true);
  assert.equal(second.signal.aborted, false);
  release();
  assert.equal(await oldCompletion, false);
  assert.deepEqual(committed, []);
  assert.equal(requests.active, true);
  assert.equal(requests.isCurrent(second), true);
  if (requests.isCurrent(second)) committed.push('new queue');
  assert.equal(requests.finish(second), true);
  assert.deepEqual(committed, ['new queue']);
  assert.equal(requests.active, false);
});

test('cancel invalidates preparation immediately and the next submission starts cleanly', () => {
  const requests = createRequestLifecycle();
  assert.equal(requests.cancel(), false);
  const canceled = requests.start();
  let aborts = 0;
  canceled.signal.addEventListener('abort', () => { aborts++; });
  assert.equal(requests.cancel(), true);
  assert.equal(requests.cancel(), false);
  assert.equal(aborts, 1);
  assert.equal(requests.isCurrent(canceled), false);
  assert.equal(requests.finish(canceled), false);
  const next = requests.start();
  assert.notEqual(next.id, canceled.id);
  assert.equal(next.signal.aborted, false);
  assert.equal(requests.finish(next), true);
  assert.equal(requests.isCurrent(next), false);
});
