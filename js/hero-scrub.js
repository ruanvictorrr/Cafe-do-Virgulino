(() => {
  const hero = document.querySelector("[data-hero]");
  const canvas = hero && hero.querySelector("[data-hero-canvas]");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const TOTAL = 145;
  const FOCAL_X = 0.5;
  const LATE_AT = 0.62;
  const src = (i) => `assets/frames/f${String(i).padStart(3, "0")}.webp`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    hero.classList.add("is-static");
    return;
  }

  const frames = new Array(TOTAL);
  let target = 0;
  let current = 0;
  let drawn = -1;
  let width = 0;
  let height = 0;
  let running = false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawn = -1;
    paint(Math.round(current));
  };

  const nearest = (index) => {
    for (let d = 0; d < TOTAL; d++) {
      const a = frames[index - d];
      if (a && a.complete && a.naturalWidth) return a;
      const b = frames[index + d];
      if (b && b.complete && b.naturalWidth) return b;
    }
    return null;
  };

  const paint = (index) => {
    const img = nearest(index);
    if (!img || !width) return;
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (width - w) * FOCAL_X;
    const y = (height - h) * 0.5;
    ctx.drawImage(img, x, y, w, h);
    drawn = index;
  };

  const readProgress = () => {
    const span = hero.offsetHeight - window.innerHeight;
    const rect = hero.getBoundingClientRect();
    return Math.min(1, Math.max(0, -rect.top / span));
  };

  const tick = () => {
    const diff = target - current;
    current += Math.abs(diff) < 0.02 ? diff : diff * 0.14;
    const index = Math.round(current);
    if (index !== drawn) paint(index);
    if (Math.abs(target - current) > 0.02) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  };

  const onScroll = () => {
    const p = readProgress();
    target = p * (TOTAL - 1);
    hero.style.setProperty("--p", p.toFixed(4));
    hero.classList.toggle("is-late", p > LATE_AT);
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  };

  const load = (i) =>
    new Promise((resolve) => {
      if (frames[i]) return resolve();
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        if (i === Math.round(current)) paint(i);
        resolve();
      };
      img.src = src(i);
      frames[i] = img;
    });

  const order = [];
  for (let i = 0; i < TOTAL; i += 8) order.push(i);
  for (let i = 0; i < TOTAL; i++) if (i % 8) order.push(i);

  const preload = async () => {
    await load(0);
    resize();
    const batch = 6;
    for (let i = 1; i < order.length; i += batch) {
      await Promise.all(order.slice(i, i + batch).map(load));
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    resize();
    onScroll();
  });
  preload().then(onScroll);
  onScroll();
})();
