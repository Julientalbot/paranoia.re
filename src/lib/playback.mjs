/** One lifecycle for visible demonstrations. */
export function canPlay({ visible, pageVisible, paused, reduced, complete }) {
  return visible && pageVisible && !paused && !reduced && !complete;
}

export function createPlayback(
  element,
  { frames, interval = 1800, loop = false, render },
) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let visible = false;
  let paused = false;
  let complete = false;
  let timer;

  function update() {
    clearTimeout(timer);
    const playing = canPlay({
      visible,
      pageVisible: !document.hidden,
      paused,
      reduced: reduced.matches,
      complete,
    });
    element.dataset.motionState = reduced.matches
      ? "reduced"
      : paused
        ? "paused"
        : complete
          ? "complete"
          : playing
            ? "playing"
            : "suspended";
    element.dataset.motionFrame = String(frame);
    render(reduced.matches ? frames - 1 : frame, reduced.matches);
    if (playing)
      timer = setTimeout(() => {
        if (frame < frames - 1) frame++;
        else if (loop) frame = 0;
        else complete = true;
        update();
      }, interval);
  }

  const pause = (value) => {
    paused = value;
    update();
  };
  const replay = () => {
    frame = 0;
    complete = false;
    paused = false;
    update();
  };
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      update();
    },
    { threshold: 0.1 },
  );
  observer.observe(element);
  document.addEventListener("visibilitychange", update);
  reduced.addEventListener("change", update);
  update();
  return {
    pause,
    replay,
    destroy() {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
    },
  };
}
