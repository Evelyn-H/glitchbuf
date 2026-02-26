/// <reference path="glitchsp.ts" />

function rgbaToGlitch(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const buf = new Uint8Array(width * height * 3);
  for (let r = 0; r < height; r++) {
    const glitchRow = height - 1 - r;
    for (let c = 0; c < width; c++) {
      const src = (r * width + c) * 4;
      const dst = (glitchRow * width + c) * 3;
      buf[dst]     = data[src + 2]; // B
      buf[dst + 1] = data[src + 1]; // G
      buf[dst + 2] = data[src];     // R
    }
  }
  return buf;
}

function glitchToRgba(buf: Uint8Array, width: number, height: number): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
  for (let r = 0; r < height; r++) {
    const glitchRow = height - 1 - r;
    for (let c = 0; c < width; c++) {
      const src = (glitchRow * width + c) * 3;
      const dst = (r * width + c) * 4;
      out[dst]     = buf[src + 2]; // R
      out[dst + 1] = buf[src + 1]; // G
      out[dst + 2] = buf[src];     // B
      out[dst + 3] = 255;
    }
  }
  return out;
}

class GlitchBuffer {
  data: Uint8Array;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  select(startPct: number, endPct: number, fn: (sub: GlitchBuffer) => void): this {
    const len = this.data.length;
    const start = Math.floor(startPct * len);
    const end = Math.floor(endPct * len);
    const sub = new GlitchBuffer(this.data.slice(start, end));
    fn(sub);
    this.data.set(sub.data, start);
    return this;
  }

  reverse(): this {
    this.data.reverse();
    return this;
  }

  bitcrush(bits: number): this {
    const step = Math.pow(2, 8 - bits);
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = Math.floor(this.data[i] / step) * step;
    }
    return this;
  }

  noise(amount: number): this {
    for (let i = 0; i < this.data.length; i++) {
      const val = this.data[i] + (Math.random() * 2 - 1) * amount;
      this.data[i] = Math.max(0, Math.min(255, Math.round(val)));
    }
    return this;
  }

  echo(times: number, gainDb: number): this {
    const len = this.data.length;
    const delay = Math.floor(len / (times + 1));
    for (let k = 1; k <= times; k++) {
      const gain = Math.pow(10, (gainDb * k) / 20);
      for (let i = 0; i < len - k * delay; i++) {
        const val = this.data[i + k * delay] + gain * this.data[i];
        this.data[i + k * delay] = Math.max(0, Math.min(255, Math.round(val)));
      }
    }
    return this;
  }
}

let originalBuffer: Uint8Array | null = null;
let imgWidth = 0;
let imgHeight = 0;

const fileInput  = document.getElementById('file')     as HTMLInputElement;
const codeArea   = document.getElementById('code')     as HTMLTextAreaElement;
const runBtn     = document.getElementById('run')      as HTMLButtonElement;
const downloadBtn= document.getElementById('download') as HTMLButtonElement;
const errorPre   = document.getElementById('error')    as HTMLPreElement;
const canvas     = document.getElementById('canvas')   as HTMLCanvasElement;
const ctx        = canvas.getContext('2d')!;

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      imgWidth  = img.naturalWidth;
      imgHeight = img.naturalHeight;
      canvas.width  = imgWidth;
      canvas.height = imgHeight;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
      originalBuffer = rgbaToGlitch(imageData.data, imgWidth, imgHeight);
      errorPre.textContent = '';
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
});

runBtn.addEventListener('click', () => {
  if (!originalBuffer) {
    errorPre.textContent = 'No image loaded.';
    return;
  }
  errorPre.textContent = '';
  try {
    const image = new GlitchBuffer(originalBuffer.slice());
    const code = codeArea.value;
    runGlitchsp(code, image);
    const rgba = glitchToRgba(image.data, imgWidth, imgHeight);
    const imageData = new ImageData(rgba, imgWidth, imgHeight);
    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    errorPre.textContent = String(e);
  }
});

downloadBtn.addEventListener('click', () => {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glitchbuf.png';
    a.click();
    URL.revokeObjectURL(url);
  });
});
