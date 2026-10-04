// How long one loop of a GIF lasts (ms): the sum of its frames' delays,
// read from the file's Graphic Control Extensions. null when it can't be
// read. Results are cached per URL.
const cache = new Map<string, Promise<number | null>>();

export function gifLength(url: string): Promise<number | null> {
  if (!/\.gif($|\?)/i.test(url)) return Promise.resolve(null);
  let p = cache.get(url);
  if (!p) {
    p = fetch(url).then(r => (r.ok ? r.arrayBuffer() : null)).then(buf => {
      if (!buf) return null;
      const b = new Uint8Array(buf);
      let ms = 0;
      // Graphic Control Extension: 21 F9 04 <flags> <delay lo> <delay hi> <transparent> 00
      for (let i = 0; i + 7 < b.length; i++) {
        if (b[i] === 0x21 && b[i + 1] === 0xf9 && b[i + 2] === 0x04 && b[i + 7] === 0x00) {
          const d = (b[i + 4] | (b[i + 5] << 8)) * 10;
          ms += d < 20 ? 100 : d; // browsers show 0 and 10ms delays as 100ms
          i += 7;
        }
      }
      return ms || null;
    }).catch(() => null);
    cache.set(url, p);
  }
  return p;
}
