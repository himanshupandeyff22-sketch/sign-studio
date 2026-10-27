// One foreground operation owns the result. Aborted work must never commit a
// stale queue or release the lock belonging to a newer submission.
export function createRequestLifecycle() {
  let current = null;
  let serial = 0;
  const cancel = () => {
    if (!current) return false;
    const previous = current;
    current = null;
    previous.controller.abort();
    return true;
  };
  return {
    get active() { return current !== null; },
    start() {
      cancel();
      const controller = new AbortController();
      current = {id: ++serial, controller, signal: controller.signal};
      return current;
    },
    isCurrent(operation) { return current === operation && !operation.signal.aborted; },
    finish(operation) {
      if (current !== operation) return false;
      current = null;
      return true;
    },
    cancel,
  };
}
