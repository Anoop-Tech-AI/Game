import './style.css';
import { Engine } from './core/Engine';
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Failed to locate WebGL canvas element');
        return;
    }
    try {
        const engine = new Engine(canvas);
        (window as any).engine = engine;
        engine.start();
        console.log('EXTREME CITY DRIVE: Living City Initialized Successfully.');
    }
    catch (err) {
        console.error('Error starting game engine:', err);
    }
});
