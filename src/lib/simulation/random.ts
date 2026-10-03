export type Rng = () => number;

export const DEFAULT_SEED = 42;

/** Reads `?seed=` from the URL, falling back to the rehearsed demo seed. */
export function parseSeed(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return DEFAULT_SEED;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? Math.abs(parsed) : DEFAULT_SEED;
}

/**
 * mulberry32 — small, fast, seedable PRNG. A fixed seed replays the exact same
 * demo, which is what the `?seed=` URL parameter relies on.
 */
export function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The three independent draw sequences a simulated night needs. Keeping them
 * apart is what makes baseline and intervention runs comparable: an
 * intervention changes a participation *threshold*, never the uniforms drawn,
 * so both runs see the same rock-paper-scissors throws and the same coin flips.
 */
export const STREAM = {
  throws: 1,
  participation: 2,
  products: 3,
} as const;

/** A 32-bit avalanche mix, so adjacent (seed, night) pairs give unrelated streams. */
export function hashInts(...values: number[]): number {
  let h = 0x9e3779b9;
  for (const value of values) {
    h = (h ^ value) >>> 0;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
  }
  return h >>> 0;
}

/** The common-random-numbers generator for one stream of one night. */
export function streamFor(seed: number, night: number, stream: number): Rng {
  return mulberry32(hashInts(seed, night, stream));
}
