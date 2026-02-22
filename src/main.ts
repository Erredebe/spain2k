import './style.css';
import { GameApp } from './core/engine/GameApp';
import type Phaser from 'phaser';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) {
  throw new Error('Missing #app root element');
}

declare global {
  interface Window {
    __SPAIN2K_RUNTIME__?: {
      focusActivated: boolean;
      lastCanvasKey: string | null;
    };
  }
}

root.innerHTML = '';
const app = new GameApp();
const game = app.mount();

window.__SPAIN2K_RUNTIME__ = {
  focusActivated: false,
  lastCanvasKey: null,
};

const resolveCanvas = (instance: Phaser.Game): HTMLCanvasElement | null =>
  (instance.canvas as HTMLCanvasElement | null) ?? root.querySelector('canvas');

const canvas = resolveCanvas(game);
if (canvas) {
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'SPAIN 2K game canvas');

  const overlay = document.createElement('div');
  overlay.className = 'focus-overlay';
  overlay.textContent = 'Haz clic para activar controles / Click to enable controls';
  root.appendChild(overlay);

  const activateFocus = (): void => {
    canvas.focus();
    window.__SPAIN2K_RUNTIME__ = {
      ...(window.__SPAIN2K_RUNTIME__ ?? { lastCanvasKey: null }),
      focusActivated: true,
    };
    overlay.remove();
    window.removeEventListener('pointerdown', activateFocus);
  };

  window.addEventListener('pointerdown', activateFocus, { once: true });
  canvas.addEventListener('keydown', (event) => {
    if (!window.__SPAIN2K_RUNTIME__) {
      return;
    }
    window.__SPAIN2K_RUNTIME__.lastCanvasKey = event.code;
  });
}
