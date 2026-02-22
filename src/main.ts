import './style.css';
import { GameApp } from './core/engine/GameApp';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) {
  throw new Error('Missing #app root element');
}

root.innerHTML = '';
const app = new GameApp();
app.mount();
