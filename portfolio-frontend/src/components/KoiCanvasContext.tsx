/**
 * Shared registry for the live Ascii Koi background canvas.
 * Allows liquid glass panels to sample and refract the live swimming fish in real-time.
 */

type FrameListener = (canvas: HTMLCanvasElement) => void;

class KoiCanvasManager {
  private canvas: HTMLCanvasElement | null = null;
  private listeners: Set<FrameListener> = new Set();

  setCanvas(canvas: HTMLCanvasElement | null) {
    this.canvas = canvas;
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  subscribe(listener: FrameListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  broadcast(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    for (const listener of this.listeners) {
      listener(canvas);
    }
  }
}

export const koiManager = new KoiCanvasManager();

