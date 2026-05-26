// Vanilla Canvas2D shim — drop-in replacement for @makko/engine.
// Exposes the same MakkoEngine.display / MakkoEngine.input API surface
// so every other source file works without changes (other than the import path).

type GradientStop = { offset: number; color: string };
type GradientFill = {
  type: 'linear';
  x0: number; y0: number; x1: number; y1: number;
  stops: GradientStop[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FillStyle = string | GradientFill | any;

interface DrawOpts {
  fill?: FillStyle;
  stroke?: string;
  lineWidth?: number;
  shadow?: { color: string; blur: number };
  blendMode?: string;
  alpha?: number;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  align?: CanvasTextAlign;   // alias for textAlign used in some templates
  baseline?: CanvasTextBaseline;
  lineHeight?: number;
  font?: string;
}

class DisplayManager {
  private ctx!: CanvasRenderingContext2D;
  private _width = 1920;
  private _height = 1080;
  private _alpha = 1;
  private _offsetX = 0;
  private _offsetY = 0;
  private _scaleX = 1;
  private _scaleY = 1;

  init(canvas: HTMLCanvasElement, width: number, height: number) {
    this._width = width;
    this._height = height;
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d')!;

    const resize = () => {
      const sx = window.innerWidth / width;
      const sy = window.innerHeight / height;
      const s = Math.min(sx, sy);
      canvas.style.width = `${width * s}px`;
      canvas.style.height = `${height * s}px`;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  get width() { return this._width; }
  get height() { return this._height; }
  get globalAlpha() { return this._alpha; }
  get canvas() { return this.ctx.canvas; }
  get currentScale() { return this._scaleX; }

  beginFrame() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._offsetX = 0; this._offsetY = 0;
    this._scaleX = 1; this._scaleY = 1;
    this._alpha = 1;
    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = 'transparent';
    this.ctx.globalCompositeOperation = 'source-over';
  }

  endFrame() {}

  clear(color: string) {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, this._width, this._height);
    ctx.restore();
  }

  setGlobalOffset(x: number, y: number) {
    this._offsetX = x; this._offsetY = y;
    this._scaleX = 1; this._scaleY = 1;
    this.ctx.setTransform(1, 0, 0, 1, x, y);
  }

  scale(sx: number, sy: number) {
    this._scaleX = sx; this._scaleY = sy;
    this.ctx.setTransform(sx, 0, 0, sy, this._offsetX, this._offsetY);
  }

  setGlobalAlpha(a: number) {
    this._alpha = Math.max(0, Math.min(1, a));
    this.ctx.globalAlpha = this._alpha;
  }

  setImageSmoothing(enabled: boolean) {
    this.ctx.imageSmoothingEnabled = enabled;
  }

  measureText(text: string, opts?: DrawOpts): { width: number } {
    const ctx = this.ctx;
    ctx.font = opts?.font ?? `${opts?.fontSize ?? 16}px ${opts?.fontFamily ?? 'sans-serif'}`;
    return { width: ctx.measureText(text).width };
  }

  private _resolveFill(fill: FillStyle): string | CanvasGradient {
    if (typeof fill === 'string') return fill;
    if (fill && fill.type === 'linear') {
      const g = this.ctx.createLinearGradient(fill.x0, fill.y0, fill.x1, fill.y1);
      for (const s of fill.stops) g.addColorStop(s.offset, s.color);
      return g;
    }
    return 'transparent';
  }

  private _applyShadow(opts?: DrawOpts) {
    if (opts?.shadow) {
      this.ctx.shadowColor = opts.shadow.color;
      this.ctx.shadowBlur = opts.shadow.blur;
    }
  }
  private _clearShadow() { this.ctx.shadowBlur = 0; this.ctx.shadowColor = 'transparent'; }
  private _applyBlend(opts?: DrawOpts) {
    if (opts?.blendMode) this.ctx.globalCompositeOperation = opts.blendMode as GlobalCompositeOperation;
  }
  private _clearBlend() { this.ctx.globalCompositeOperation = 'source-over'; }

  private _withAlpha(opts: DrawOpts | undefined, fn: () => void) {
    if (opts?.alpha !== undefined) {
      const prev = this._alpha;
      this.ctx.globalAlpha = prev * opts.alpha;
      fn();
      this.ctx.globalAlpha = prev;
    } else { fn(); }
  }

  drawRect(x: number, y: number, w: number, h: number, opts?: DrawOpts) {
    const ctx = this.ctx;
    this._withAlpha(opts, () => {
      this._applyBlend(opts); this._applyShadow(opts);
      if (opts?.fill) { ctx.fillStyle = this._resolveFill(opts.fill); ctx.fillRect(x, y, w, h); }
      this._clearShadow();
      if (opts?.stroke) { ctx.strokeStyle = opts.stroke; ctx.lineWidth = opts.lineWidth ?? 1; ctx.strokeRect(x, y, w, h); }
      this._clearBlend();
    });
  }

  drawRoundRect(x: number, y: number, w: number, h: number, radius: number, opts?: DrawOpts) {
    const ctx = this.ctx;
    this._withAlpha(opts, () => {
      this._applyBlend(opts); this._applyShadow(opts);
      ctx.beginPath(); ctx.roundRect(x, y, w, h, radius);
      if (opts?.fill) { ctx.fillStyle = this._resolveFill(opts.fill); ctx.fill(); }
      this._clearShadow();
      if (opts?.stroke) { ctx.strokeStyle = opts.stroke; ctx.lineWidth = opts.lineWidth ?? 1; ctx.stroke(); }
      this._clearBlend();
    });
  }

  drawCircle(x: number, y: number, r: number, opts?: DrawOpts) {
    const ctx = this.ctx;
    this._withAlpha(opts, () => {
      this._applyBlend(opts); this._applyShadow(opts);
      ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
      if (opts?.fill && opts.fill !== 'none') { ctx.fillStyle = this._resolveFill(opts.fill); ctx.fill(); }
      this._clearShadow();
      if (opts?.stroke && opts.stroke !== 'none') { ctx.strokeStyle = opts.stroke; ctx.lineWidth = opts.lineWidth ?? 1; ctx.stroke(); }
      this._clearBlend();
    });
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, opts?: DrawOpts) {
    const ctx = this.ctx;
    this._withAlpha(opts, () => {
      this._applyShadow(opts);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = opts?.stroke ?? '#ffffff';
      ctx.lineWidth = opts?.lineWidth ?? 1;
      ctx.stroke(); this._clearShadow();
    });
  }

  // Accepts both (x, y, text, opts) and (text, x, y, opts) argument orders.
  // Some original Makko templates used one order, some the other.
  drawText(xOrText: number | string, yOrX: number | string, textOrY: string | number, opts?: DrawOpts) {
    let x: number, y: number, text: string;
    if (typeof xOrText === 'string') {
      text = xOrText; x = yOrX as number; y = textOrY as number;
    } else {
      x = xOrText; y = yOrX as number; text = textOrY as string;
    }

    const ctx = this.ctx;
    if (opts?.font) {
      ctx.font = opts.font;
    } else {
      ctx.font = `${opts?.fontSize ?? 16}px ${opts?.fontFamily ?? 'sans-serif'}`;
    }
    ctx.textAlign = opts?.textAlign ?? 'left';
    ctx.textBaseline = 'middle';

    this._withAlpha(opts, () => {
      this._applyShadow(opts);
      const lines = String(text).split('\n');
      const fontSize = opts?.fontSize ?? 16;
      const lineHeight = opts?.lineHeight ?? fontSize * 1.4;

      if (opts?.fill) {
        ctx.fillStyle = this._resolveFill(opts.fill);
        for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], x, y + i * lineHeight);
      }
      this._clearShadow();
      if (opts?.stroke) {
        ctx.strokeStyle = opts.stroke; ctx.lineWidth = opts.lineWidth ?? 1;
        for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], x, y + i * lineHeight);
      }
    });
  }
}

class InputManager {
  private _held = new Set<string>();
  private _pressed = new Set<string>();
  private _heldMouse = new Set<number>();
  private _pressedMouse = new Set<number>();
  private _mouseX = 0;
  private _mouseY = 0;
  private _gameW = 1920;
  private _gameH = 1080;
  private _canvas?: HTMLCanvasElement;

  init(canvas: HTMLCanvasElement, w: number, h: number) {
    this._canvas = canvas;
    this._gameW = w; this._gameH = h;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this._held.add(e.code); this._pressed.add(e.code);
      const scene = (MakkoEngine.instance as any)?.getActiveScene?.();
      (scene as any)?.onKeyDown?.(e.code);
      e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
      this._held.delete(e.code);
      const scene = (MakkoEngine.instance as any)?.getActiveScene?.();
      (scene as any)?.onKeyUp?.(e.code);
    });

    canvas.addEventListener('mousedown', (e) => {
      this._heldMouse.add(e.button); this._pressedMouse.add(e.button);
      this._updatePos(e);
      const scene = (MakkoEngine.instance as any)?.getActiveScene?.();
      (scene as any)?.onMouseDown?.(e.button, this._mouseX, this._mouseY);
      e.preventDefault();
    });

    canvas.addEventListener('mouseup', (e) => {
      this._heldMouse.delete(e.button);
      const scene = (MakkoEngine.instance as any)?.getActiveScene?.();
      (scene as any)?.onMouseUp?.(e.button, this._mouseX, this._mouseY);
    });

    canvas.addEventListener('mousemove', (e) => this._updatePos(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private _updatePos(e: MouseEvent) {
    if (!this._canvas) return;
    const rect = this._canvas.getBoundingClientRect();
    this._mouseX = (e.clientX - rect.left) * (this._gameW / rect.width);
    this._mouseY = (e.clientY - rect.top) * (this._gameH / rect.height);
  }

  capture(_keys: string[]) {}

  isKeyDown(key: string) { return this._held.has(key); }
  isKeyPressed(key: string) { return this._pressed.has(key); }
  isMouseDown(button = 0) { return this._heldMouse.has(button); }
  isMousePressed(button = 0) { return this._pressedMouse.has(button); }
  get mouseX() { return this._mouseX; }
  get mouseY() { return this._mouseY; }

  endFrame() { this._pressed.clear(); this._pressedMouse.clear(); }
}

const display = new DisplayManager();
const input = new InputManager();

export const MakkoEngine = {
  display,
  input,
  instance: null as any,

  async initEngine(opts: {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    manifests?: string[];
  }) {
    display.init(opts.canvas, opts.width, opts.height);
    input.init(opts.canvas, opts.width, opts.height);
  },
};
