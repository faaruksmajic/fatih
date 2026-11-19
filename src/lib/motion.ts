/**
 * Small, dependency-free motion helpers in the spirit of Apple's
 * "Designing Fluid Interfaces": springs described by damping ratio and
 * response (not duration), velocity hand-off, momentum projection and
 * rubber-banding at soft edges.
 */

export type Spring = {
  /** Stop the spring where it is and return its live value and velocity. */
  stop: () => { value: number; velocity: number };
  readonly value: number;
  readonly velocity: number;
  readonly running: boolean;
};

export type SpringOptions = {
  /** 1 = critically damped (no overshoot); < 1 bounces. */
  damping?: number;
  /** Seconds to (roughly) reach the target. Lower is snappier. */
  response?: number;
  /** Initial velocity in units per second (the gesture's release velocity). */
  velocity?: number;
  /** Settle threshold in the animated unit. */
  precision?: number;
};

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Animate a number with a spring. Always starts from `from` (pass the live,
 * on-screen value) so a new spring can take over mid-flight without a jump.
 */
export function spring(
  from: number,
  to: number,
  { damping = 1, response = 0.4, velocity = 0, precision = 0.5 }: SpringOptions,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
): Spring {
  let x = from;
  let v = velocity;
  let raf = 0;
  let running = true;

  const finish = () => {
    x = to;
    v = 0;
    running = false;
    onUpdate(x);
    onComplete?.();
  };

  if (prefersReducedMotion()) {
    finish();
  } else {
    // Apple's designer-friendly parameters mapped onto a unit-mass spring.
    const stiffness = (2 * Math.PI / response) ** 2;
    const friction = (4 * Math.PI * damping) / response;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 15);
      last = now;
      const steps = Math.max(1, Math.ceil(dt * 240));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const a = -stiffness * (x - to) - friction * v;
        v += a * h;
        x += v * h;
      }
      if (Math.abs(x - to) < precision && Math.abs(v) < precision * 20) {
        finish();
        return;
      }
      onUpdate(x);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  return {
    stop() {
      if (running) cancelAnimationFrame(raf);
      running = false;
      return { value: x, velocity: v };
    },
    get value() {
      return x;
    },
    get velocity() {
      return v;
    },
    get running() {
      return running;
    },
  };
}

/**
 * Where a flick would come to rest, using the exponential-decay projection
 * Apple ships with scroll views. decelerationRate 0.998 = normal scroll feel.
 */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past an edge: the further you pull, the less it follows. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

/** Keeps a short pointer history so the release velocity is measured, not guessed. */
export class VelocityTracker {
  private samples: { t: number; x: number; y: number }[] = [];

  reset() {
    this.samples = [];
  }

  add(x: number, y: number, t = performance.now()) {
    this.samples.push({ t, x, y });
    // Only the last ~100ms say anything about the release.
    while (this.samples.length > 2 && t - this.samples[0].t > 100) {
      this.samples.shift();
    }
  }

  /** px per second */
  velocity() {
    const s = this.samples;
    if (s.length < 2) return { x: 0, y: 0 };
    const a = s[0];
    const b = s[s.length - 1];
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0) return { x: 0, y: 0 };
    // A finger that stopped before lifting should not throw.
    if (performance.now() - b.t > 80) return { x: 0, y: 0 };
    return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
  }
}
