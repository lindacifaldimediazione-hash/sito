/* Logo "L." — the supplied artwork, split into a blue layer and a gold layer (alpha PNGs).
   Each layer is filled with a gradient of the chosen colour on a canvas and exported as an
   image, so the real logo is recoloured and renders reliably in every browser. */

const __LR = window.__resources || {};
const LOGO_SRC = {
  blue: __LR.logoMaskBlue || 'img/logo-mask-blue.png',
  gold: __LR.logoMaskGold || 'img/logo-mask-gold.png'
};

const logoState = { blue: '#0F3BAE', gold: '#C89A3F', url: null, key: '' };
const logoSubs = new Set();
let logoMasks = null;

function loadImg(src) {
  return new Promise((res, rej) => {const i = new Image();i.onload = () => res(i);i.onerror = rej;i.src = src;});
}
function mix(hex, other, t) {
  const p = (h) => {const n = parseInt(h.replace('#', ''), 16);return [n >> 16 & 255, n >> 8 & 255, n & 255];};
  const a = p(hex),b = p(other);
  return `rgb(${a.map((v, i) => Math.round(v * t + b[i] * (1 - t))).join(',')})`;
}
async function renderLogo() {
  const key = logoState.blue + logoState.gold;
  if (key === logoState.key && logoState.url) return;
  if (!logoMasks) logoMasks = await Promise.all([loadImg(LOGO_SRC.gold), loadImg(LOGO_SRC.blue)]);
  const [gm, bm] = logoMasks;
  const W = bm.naturalWidth,H = bm.naturalHeight;
  const out = document.createElement('canvas');out.width = W;out.height = H;
  const octx = out.getContext('2d');
  const layer = (mask, stops, x0, y0, x1, y1) => {
    const c = document.createElement('canvas');c.width = W;c.height = H;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(x0 * W, y0 * H, x1 * W, y1 * H);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    x.fillStyle = g;x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(mask, 0, 0, W, H);
    octx.drawImage(c, 0, 0);
  };
  const G = logoState.gold,B = logoState.blue;
  layer(gm, [[0, mix(G, '#000000', 0.76)], [0.38, mix(G, '#ffffff', 0.55)], [0.7, G], [1, mix(G, '#ffffff', 0.55)]], 0, 0.5, 1, 0.9);
  layer(bm, [[0, mix(B, '#ffffff', 0.58)], [0.42, B], [1, mix(B, '#000000', 0.74)]], 0.75, 0, 0.25, 1);
  logoState.url = out.toDataURL('image/png');
  logoState.key = key;
  logoSubs.forEach((fn) => fn(logoState.url));
}

function setLogoColors(blue, gold) {
  if (blue) logoState.blue = blue;
  if (gold) logoState.gold = gold;
  renderLogo().catch(() => {});
}

function LogoMark({ size = 42, className = '' }) {
  const [url, setUrl] = React.useState(logoState.url);
  React.useEffect(() => {
    logoSubs.add(setUrl);
    if (!logoState.url) renderLogo().catch(() => {});
    return () => logoSubs.delete(setUrl);
  }, []);
  const w = size,h = Math.round(size * 1024 / 1536);
  return (
    <span className={`logo-mark ${className}`} style={{ width: w, height: h }} aria-hidden="true">
      {url && <img src={url} alt="" width={w} height={h} style={{ display: 'block', width: '100%', height: '100%' }} />}
    </span>);

}

Object.assign(window, { LogoMark, setLogoColors });
