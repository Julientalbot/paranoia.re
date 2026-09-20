import { test } from "node:test";
import assert from "node:assert/strict";
import { canPlay, createPlayback } from "./playback.mjs";

test("playback respects every independent suspension condition", () => {
  const ready = {
    visible: true,
    pageVisible: true,
    paused: false,
    reduced: false,
    complete: false,
  };
  assert.equal(canPlay(ready), true);
  for (const key of Object.keys(ready))
    assert.equal(canPlay({ ...ready, [key]: !ready[key] }), false, key);
});

test("tab visibility and viewport re-entry cannot override a user pause; replay resets a completed demo", () => {
  const globals = Object.fromEntries(
    [
      "document",
      "matchMedia",
      "IntersectionObserver",
      "setTimeout",
      "clearTimeout",
    ].map((k) => [k, globalThis[k]]),
  );
  let timer, intersection, renderFrame;
  const listeners = {};
  const media = {
    matches: false,
    addEventListener: (_, fn) => (listeners.media = fn),
    removeEventListener: () => {},
  };
  globalThis.document = {
    hidden: false,
    documentElement: { lang: "fr" },
    addEventListener: (_, fn) => (listeners.visibility = fn),
    removeEventListener: () => {},
  };
  globalThis.matchMedia = () => media;
  globalThis.IntersectionObserver = class {
    constructor(fn) {
      intersection = fn;
    }
    observe() {}
    disconnect() {}
  };
  globalThis.setTimeout = (fn) => {
    timer = fn;
    return 1;
  };
  globalThis.clearTimeout = () => {
    timer = null;
  };
  const element = {
    dataset: {},
    querySelectorAll: () => [],
    addEventListener: () => {},
  };
  const tick = () => {
    assert.ok(timer);
    const fn = timer;
    timer = null;
    fn();
  };
  try {
    const control = createPlayback(element, {
      frames: 3,
      render: (frame) => (renderFrame = frame),
    });
    assert.equal(element.dataset.motionState, "suspended");
    assert.equal(renderFrame, 0);
    intersection([{ isIntersecting: true }]);
    tick();
    assert.equal(renderFrame, 1);
    document.hidden = true;
    listeners.visibility();
    assert.equal(timer, null);
    control.pause(true);
    document.hidden = false;
    listeners.visibility();
    intersection([{ isIntersecting: false }]);
    intersection([{ isIntersecting: true }]);
    assert.equal(element.dataset.motionState, "paused");
    assert.equal(renderFrame, 1);
    assert.equal(timer, null);
    control.pause(false);
    tick();
    tick();
    assert.equal(element.dataset.motionState, "complete");
    assert.equal(timer, null);
    intersection([{ isIntersecting: false }]);
    intersection([{ isIntersecting: true }]);
    assert.equal(renderFrame, 2);
    assert.equal(timer, null);
    control.replay();
    assert.equal(renderFrame, 0);
    assert.equal(element.dataset.motionState, "playing");
    media.matches = true;
    listeners.media();
    assert.equal(renderFrame, 2);
    assert.equal(timer, null);
    control.destroy();
  } finally {
    for (const [key, value] of Object.entries(globals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
