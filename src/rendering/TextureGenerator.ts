import * as THREE from 'three';
export class TextureGenerator {
    private static cache: Map<string, THREE.Texture> = new Map();
    public static createAsphaltTexture(): {
        map: THREE.CanvasTexture;
        normalMap: THREE.CanvasTexture;
        roughnessMap: THREE.CanvasTexture;
    } {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const nCanvas = document.createElement('canvas');
        nCanvas.width = size;
        nCanvas.height = size;
        const nCtx = nCanvas.getContext('2d')!;
        const rCanvas = document.createElement('canvas');
        rCanvas.width = size;
        rCanvas.height = size;
        const rCtx = rCanvas.getContext('2d')!;
        ctx.fillStyle = '#222428';
        ctx.fillRect(0, 0, size, size);
        rCtx.fillStyle = '#c4c8ce';
        rCtx.fillRect(0, 0, size, size);
        nCtx.fillStyle = '#8080ff';
        nCtx.fillRect(0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size);
        const nData = nCtx.getImageData(0, 0, size, size);
        const rData = rCtx.getImageData(0, 0, size, size);
        const pixels = imgData.data;
        const nPixels = nData.data;
        const rPixels = rData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            const noise = (Math.random() - 0.5) * 38;
            const grain = Math.random() > 0.94 ? (Math.random() * 50 - 25) : 0;
            const val = Math.min(255, Math.max(0, 36 + noise + grain));
            pixels[i] = val + (Math.random() * 4 - 2);
            pixels[i + 1] = val + (Math.random() * 4 - 2);
            pixels[i + 2] = val + 2;
            pixels[i + 3] = 255;
            const nx = Math.floor(128 + (Math.random() - 0.5) * 40);
            const ny = Math.floor(128 + (Math.random() - 0.5) * 40);
            nPixels[i] = nx;
            nPixels[i + 1] = ny;
            nPixels[i + 2] = 240;
            nPixels[i + 3] = 255;
            rPixels[i] = Math.min(255, Math.max(140, 195 + noise * 1.5));
            rPixels[i + 1] = rPixels[i];
            rPixels[i + 2] = rPixels[i];
            rPixels[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        nCtx.putImageData(nData, 0, 0);
        rCtx.putImageData(rData, 0, 0);
        ctx.strokeStyle = '#15171a';
        ctx.lineWidth = 1.5;
        for (let c = 0; c < 12; c++) {
            let x = Math.random() * size;
            let y = Math.random() * size;
            ctx.beginPath();
            ctx.moveTo(x, y);
            for (let s = 0; s < 7; s++) {
                x += (Math.random() - 0.5) * 40;
                y += (Math.random() - 0.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        const grad = ctx.createLinearGradient(0, 0, size, 0);
        grad.addColorStop(0.18, 'rgba(15, 17, 20, 0.25)');
        grad.addColorStop(0.32, 'rgba(15, 17, 20, 0.0)');
        grad.addColorStop(0.68, 'rgba(15, 17, 20, 0.0)');
        grad.addColorStop(0.82, 'rgba(15, 17, 20, 0.25)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.colorSpace = THREE.SRGBColorSpace;
        const normalMap = new THREE.CanvasTexture(nCanvas);
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        const roughnessMap = new THREE.CanvasTexture(rCanvas);
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        return { map, normalMap, roughnessMap };
    }
    public static createRoadMarkingsTexture(): THREE.CanvasTexture {
        const w = 1024;
        const h = 2048;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, w, h);
        const drawWeatheredLine = (x1: number, y1: number, x2: number, y2: number, width: number, color: string) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        };
        const midX = w / 2;
        const yellow = '#ffb300';
        drawWeatheredLine(midX - 10, 0, midX - 10, h, 8, yellow);
        drawWeatheredLine(midX + 10, 0, midX + 10, h, 8, yellow);
        const laneWidth = w / 4;
        const dashLen = 140;
        const gapLen = 180;
        const white = '#f5f7fa';
        const leftLaneX = laneWidth;
        for (let y = 30; y < h; y += dashLen + gapLen) {
            drawWeatheredLine(leftLaneX, y, leftLaneX, Math.min(h, y + dashLen), 8, white);
        }
        const rightLaneX = w - laneWidth;
        for (let y = 30; y < h; y += dashLen + gapLen) {
            drawWeatheredLine(rightLaneX, y, rightLaneX, Math.min(h, y + dashLen), 8, white);
        }
        drawWeatheredLine(24, 0, 24, h, 10, white);
        drawWeatheredLine(w - 24, 0, w - 24, h, 10, white);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
                if (Math.random() < 0.08) {
                    data[i + 3] = Math.floor(data[i + 3] * 0.4);
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
    public static createCrosswalkTexture(): THREE.CanvasTexture {
        const w = 1024;
        const h = 512;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, w, h);
        const stripeWidth = 56;
        const stripeGap = 48;
        const stripeHeight = 340;
        const startY = 120;
        ctx.fillStyle = '#f8fafc';
        for (let x = 60; x < w - 60; x += stripeWidth + stripeGap) {
            ctx.fillRect(x, startY, stripeWidth, stripeHeight);
        }
        ctx.fillRect(40, 40, w - 80, 36);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
    public static createRoadArrowTexture(type: 'straight' | 'right' | 'left' = 'straight'): THREE.CanvasTexture {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = '#f1f5f9';
        if (type === 'straight') {
            ctx.fillRect(230, 200, 52, 280);
            ctx.beginPath();
            ctx.moveTo(256, 30);
            ctx.lineTo(160, 200);
            ctx.lineTo(230, 200);
            ctx.lineTo(230, 200);
            ctx.lineTo(282, 200);
            ctx.lineTo(352, 200);
            ctx.closePath();
            ctx.fill();
        }
        else if (type === 'right') {
            ctx.beginPath();
            ctx.lineWidth = 50;
            ctx.strokeStyle = '#f1f5f9';
            ctx.moveTo(200, 460);
            ctx.quadraticCurveTo(200, 240, 340, 240);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(430, 240);
            ctx.lineTo(320, 160);
            ctx.lineTo(320, 320);
            ctx.closePath();
            ctx.fill();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
    public static createManholeTexture(): {
        map: THREE.CanvasTexture;
        normalMap: THREE.CanvasTexture;
    } {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const nCanvas = document.createElement('canvas');
        nCanvas.width = size;
        nCanvas.height = size;
        const nCtx = nCanvas.getContext('2d')!;
        ctx.fillStyle = '#1e2124';
        ctx.fillRect(0, 0, size, size);
        nCtx.fillStyle = '#8080ff';
        nCtx.fillRect(0, 0, size, size);
        const c = size / 2;
        const r = size * 0.44;
        ctx.beginPath();
        ctx.arc(c, c, r, 0, Math.PI * 2);
        ctx.fillStyle = '#2b2e34';
        ctx.fill();
        ctx.strokeStyle = '#181a1d';
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.strokeStyle = '#383c44';
        ctx.lineWidth = 6;
        for (let rad = r - 20; rad > 30; rad -= 24) {
            ctx.beginPath();
            ctx.arc(c, c, rad, 0, Math.PI * 2);
            ctx.stroke();
        }
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            ctx.beginPath();
            ctx.moveTo(c + Math.cos(a) * 40, c + Math.sin(a) * 40);
            ctx.lineTo(c + Math.cos(a) * (r - 20), c + Math.sin(a) * (r - 20));
            ctx.stroke();
        }
        ctx.fillStyle = '#22252a';
        ctx.beginPath();
        ctx.arc(c, c, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888f98';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STORM', c, c - 10);
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('SEWER', c, c + 12);
        const img = ctx.getImageData(0, 0, size, size);
        const nImg = nCtx.getImageData(0, 0, size, size);
        for (let i = 0; i < img.data.length; i += 4) {
            const v = img.data[i];
            nImg.data[i] = 128 + (v - 40) * 0.4;
            nImg.data[i + 1] = 128 + (v - 40) * 0.4;
            nImg.data[i + 2] = 250;
            nImg.data[i + 3] = 255;
        }
        nCtx.putImageData(nImg, 0, 0);
        const map = new THREE.CanvasTexture(canvas);
        map.colorSpace = THREE.SRGBColorSpace;
        const normalMap = new THREE.CanvasTexture(nCanvas);
        return { map, normalMap };
    }
    public static createStormDrainTexture(): THREE.CanvasTexture {
        const w = 512;
        const h = 256;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#32363e';
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.fillStyle = '#2d3037';
        const barWidth = 14;
        const slotGap = 20;
        for (let x = 32; x < w - 32; x += barWidth + slotGap) {
            ctx.fillRect(x, 20, barWidth, h - 40);
            ctx.fillStyle = '#454a54';
            ctx.fillRect(x, 20, 2, h - 40);
            ctx.fillStyle = '#2d3037';
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
    public static createSidewalkTexture(): {
        map: THREE.CanvasTexture;
        normalMap: THREE.CanvasTexture;
        roughnessMap: THREE.CanvasTexture;
    } {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const nCanvas = document.createElement('canvas');
        nCanvas.width = size;
        nCanvas.height = size;
        const nCtx = nCanvas.getContext('2d')!;
        ctx.fillStyle = '#9e9fa3';
        ctx.fillRect(0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const n = (Math.random() - 0.5) * 22;
            imgData.data[i] = Math.min(255, Math.max(0, 160 + n));
            imgData.data[i + 1] = Math.min(255, Math.max(0, 162 + n));
            imgData.data[i + 2] = Math.min(255, Math.max(0, 164 + n));
            imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        ctx.strokeStyle = '#5a5b5e';
        ctx.lineWidth = 4;
        const step = size / 4;
        for (let i = 0; i <= size; i += step) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
        }
        nCtx.fillStyle = '#8080ff';
        nCtx.fillRect(0, 0, size, size);
        nCtx.strokeStyle = '#4040ff';
        nCtx.lineWidth = 5;
        for (let i = 0; i <= size; i += step) {
            nCtx.beginPath();
            nCtx.moveTo(0, i);
            nCtx.lineTo(size, i);
            nCtx.stroke();
            nCtx.beginPath();
            nCtx.moveTo(i, 0);
            nCtx.lineTo(i, size);
            nCtx.stroke();
        }
        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.colorSpace = THREE.SRGBColorSpace;
        const normalMap = new THREE.CanvasTexture(nCanvas);
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        const roughnessMap = map.clone();
        return { map, normalMap, roughnessMap };
    }
    public static createTactilePavingTexture(): THREE.CanvasTexture {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#eab308';
        ctx.fillRect(0, 0, size, size);
        const spacing = 48;
        const radius = 14;
        for (let x = spacing / 2; x < size; x += spacing) {
            for (let y = spacing / 2; y < size; y += spacing) {
                ctx.beginPath();
                ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ca8a04';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = '#fde047';
                ctx.fill();
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    public static createBuildingFacadeTexture(style: 'modern_glass' | 'corporate' | 'apartment' | 'brick'): {
        map: THREE.CanvasTexture;
        emissiveMap: THREE.CanvasTexture;
        roughnessMap: THREE.CanvasTexture;
    } {
        const w = 1024;
        const h = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        const eCanvas = document.createElement('canvas');
        eCanvas.width = w;
        eCanvas.height = h;
        const eCtx = eCanvas.getContext('2d')!;
        eCtx.fillStyle = '#000000';
        eCtx.fillRect(0, 0, w, h);
        const rCanvas = document.createElement('canvas');
        rCanvas.width = w;
        rCanvas.height = h;
        const rCtx = rCanvas.getContext('2d')!;
        const floors = 10;
        const bays = 8;
        const floorH = h / floors;
        const bayW = w / bays;
        if (style === 'modern_glass') {
            ctx.fillStyle = '#1c2430';
            ctx.fillRect(0, 0, w, h);
            rCtx.fillStyle = '#181818';
            rCtx.fillRect(0, 0, w, h);
            for (let f = 0; f < floors; f++) {
                for (let b = 0; b < bays; b++) {
                    const x = b * bayW;
                    const y = f * floorH;
                    ctx.fillStyle = '#141820';
                    ctx.fillRect(x, y, bayW, 14);
                    const isLit = Math.random() < 0.45;
                    if (isLit) {
                        const warmCol = Math.random() > 0.5 ? '#ffe8c2' : '#f5f0e8';
                        ctx.fillStyle = warmCol;
                        ctx.fillRect(x + 6, y + 18, bayW - 12, floorH - 24);
                        eCtx.fillStyle = warmCol;
                        eCtx.fillRect(x + 6, y + 18, bayW - 12, floorH - 24);
                        ctx.fillStyle = 'rgba(30, 30, 35, 0.4)';
                        const blindH = Math.random() * (floorH - 30);
                        ctx.fillRect(x + 6, y + 18, bayW - 12, blindH);
                        eCtx.fillStyle = '#000000';
                        eCtx.fillRect(x + 6, y + 18, bayW - 12, blindH);
                    }
                    else {
                        ctx.fillStyle = '#1e2838';
                        ctx.fillRect(x + 6, y + 18, bayW - 12, floorH - 24);
                    }
                    ctx.strokeStyle = '#0b0e14';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(x + 4, y + 16, bayW - 8, floorH - 20);
                    rCtx.fillStyle = '#444444';
                    rCtx.fillRect(x, y, bayW, 6);
                }
            }
        }
        else if (style === 'apartment') {
            ctx.fillStyle = '#dcdad7';
            ctx.fillRect(0, 0, w, h);
            rCtx.fillStyle = '#b0b0b0';
            rCtx.fillRect(0, 0, w, h);
            for (let f = 0; f < floors; f++) {
                for (let b = 0; b < bays; b++) {
                    const x = b * bayW;
                    const y = f * floorH;
                    ctx.fillStyle = '#4b5563';
                    ctx.fillRect(x + 16, y + 20, bayW - 32, floorH - 36);
                    const isLit = Math.random() < 0.5;
                    const glassColor = isLit ? '#fed7aa' : '#1e2430';
                    ctx.fillStyle = glassColor;
                    ctx.fillRect(x + 20, y + 24, bayW - 40, floorH - 44);
                    if (isLit) {
                        eCtx.fillStyle = '#fed7aa';
                        eCtx.fillRect(x + 20, y + 24, bayW - 40, floorH - 44);
                    }
                    ctx.strokeStyle = '#374151';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x + bayW / 2, y + 24);
                    ctx.lineTo(x + bayW / 2, y + floorH - 20);
                    ctx.stroke();
                    rCtx.fillStyle = '#151515';
                    rCtx.fillRect(x + 20, y + 24, bayW - 40, floorH - 44);
                }
            }
        }
        else if (style === 'brick') {
            ctx.fillStyle = '#8b4538';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#c4b5a5';
            ctx.lineWidth = 1;
            for (let y = 0; y < h; y += 12) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            for (let f = 0; f < floors; f++) {
                for (let b = 0; b < bays; b++) {
                    const x = b * bayW;
                    const y = f * floorH;
                    ctx.fillStyle = '#e2e8f0';
                    ctx.fillRect(x + 14, y + 14, bayW - 28, 8);
                    ctx.fillRect(x + 14, y + floorH - 18, bayW - 28, 6);
                    const isLit = Math.random() < 0.4;
                    ctx.fillStyle = isLit ? '#fef3c7' : '#1e293b';
                    ctx.fillRect(x + 20, y + 24, bayW - 40, floorH - 44);
                    if (isLit) {
                        eCtx.fillStyle = '#fef3c7';
                        eCtx.fillRect(x + 20, y + 24, bayW - 40, floorH - 44);
                    }
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(x + bayW / 2, y + 24);
                    ctx.lineTo(x + bayW / 2, y + floorH - 20);
                    ctx.moveTo(x + 20, y + floorH / 2);
                    ctx.lineTo(x + bayW - 20, y + floorH / 2);
                    ctx.stroke();
                }
            }
        }
        else {
            ctx.fillStyle = '#2d333b';
            ctx.fillRect(0, 0, w, h);
            for (let f = 0; f < floors; f++) {
                for (let b = 0; b < bays; b++) {
                    const x = b * bayW;
                    const y = f * floorH;
                    ctx.fillStyle = '#444c56';
                    ctx.fillRect(x + 2, y, 10, floorH);
                    const isLit = Math.random() < 0.6;
                    ctx.fillStyle = isLit ? '#e0f2fe' : '#111827';
                    ctx.fillRect(x + 16, y + 14, bayW - 22, floorH - 28);
                    if (isLit) {
                        eCtx.fillStyle = '#bae6fd';
                        eCtx.fillRect(x + 16, y + 14, bayW - 22, floorH - 28);
                    }
                }
            }
        }
        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.colorSpace = THREE.SRGBColorSpace;
        const emissiveMap = new THREE.CanvasTexture(eCanvas);
        emissiveMap.wrapS = THREE.RepeatWrapping;
        emissiveMap.wrapT = THREE.RepeatWrapping;
        emissiveMap.colorSpace = THREE.SRGBColorSpace;
        const roughnessMap = new THREE.CanvasTexture(rCanvas);
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        return { map, emissiveMap, roughnessMap };
    }
    public static createStorefrontTexture(storeName: string, themeColor: string): THREE.CanvasTexture {
        const w = 1024;
        const h = 512;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#181b20';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#0f1115';
        ctx.fillRect(40, 30, w - 80, 90);
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(40, 30, w - 80, 90);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 42px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '6px';
        ctx.fillText(storeName, w / 2, 90);
        ctx.fillStyle = themeColor;
        ctx.fillRect(40, 118, w - 80, 4);
        const displayW = (w - 180) / 2;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(60, 160, displayW, h - 200);
        const g1 = ctx.createLinearGradient(60, 160, 60, h - 40);
        g1.addColorStop(0, 'rgba(255, 240, 210, 0.45)');
        g1.addColorStop(1, 'rgba(20, 25, 35, 0.9)');
        ctx.fillStyle = g1;
        ctx.fillRect(60, 160, displayW, h - 200);
        const win2X = 60 + displayW + 60;
        ctx.fillStyle = g1;
        ctx.fillRect(win2X, 160, displayW, h - 200);
        const doorX = 60 + displayW;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.strokeRect(doorX + 5, 160, 50, h - 170);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(doorX + 10, 300, 4, 60);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
    public static createBrakeDiscTexture(): THREE.CanvasTexture {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const c = size / 2;
        const r = size * 0.46;
        ctx.fillStyle = '#8a929a';
        ctx.fillRect(0, 0, size, size);
        for (let rad = r; rad > 80; rad -= 2) {
            ctx.beginPath();
            ctx.arc(c, c, rad, 0, Math.PI * 2);
            ctx.strokeStyle = Math.random() > 0.5 ? '#9da6b0' : '#737a82';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
        ctx.fillStyle = '#1c1f24';
        for (let ring = 0; ring < 5; ring++) {
            const ringRad = 110 + ring * 22;
            const count = 18 + ring * 2;
            for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / count) {
                const spiralA = a + ring * 0.12;
                const hx = c + Math.cos(spiralA) * ringRad;
                const hy = c + Math.sin(spiralA) * ringRad;
                ctx.beginPath();
                ctx.arc(hx, hy, 3.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.strokeStyle = '#2d3036';
        ctx.lineWidth = 2.5;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.arc(c, c, r - 30, a, a + 0.22);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(c, c, 75, 0, Math.PI * 2);
        ctx.fillStyle = '#22252a';
        ctx.fill();
        ctx.strokeStyle = '#3a3f47';
        ctx.lineWidth = 4;
        ctx.stroke();
        for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 5) {
            const sx = c + Math.cos(a) * 44;
            const sy = c + Math.sin(a) * 44;
            ctx.beginPath();
            ctx.arc(sx, sy, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#94a3b8';
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
    public static createTireTreadTexture(): THREE.CanvasTexture {
        const w = 512;
        const h = 512;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, w, h);
        const grooveX = [70, 160, 352, 442];
        ctx.fillStyle = '#2020dd';
        grooveX.forEach(x => {
            ctx.fillRect(x - 8, 0, 16, h);
        });
        ctx.strokeStyle = '#4040ff';
        ctx.lineWidth = 5;
        for (let y = 0; y < h; y += 28) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(160, y + 16);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(512, y);
            ctx.lineTo(352, y + 16);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(180, y + 8);
            ctx.lineTo(330, y + 16);
            ctx.stroke();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    public static createCarbonFiberTexture(): THREE.CanvasTexture {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#101216';
        ctx.fillRect(0, 0, size, size);
        const step = 8;
        for (let x = 0; x < size; x += step) {
            for (let y = 0; y < size; y += step) {
                const isWeave = (Math.floor(x / step) + Math.floor(y / step)) % 2 === 0;
                ctx.fillStyle = isWeave ? '#1e2128' : '#0c0d10';
                ctx.fillRect(x, y, step, step);
                ctx.strokeStyle = isWeave ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                if (isWeave) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + step, y + step);
                }
                else {
                    ctx.moveTo(x + step, y);
                    ctx.lineTo(x, y + step);
                }
                ctx.stroke();
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(16, 16);
        return texture;
    }
    public static createHeadlightClusterTexture(): THREE.CanvasTexture {
        const w = 512;
        const h = 256;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#080a0f';
        ctx.fillRect(0, 0, w, h);
        const drawReflector = (cx: number, cy: number, r: number) => {
            const g = ctx.createRadialGradient(cx, cy, 5, cx, cy, r);
            g.addColorStop(0, '#ffffff');
            g.addColorStop(0.3, '#cbd5e1');
            g.addColorStop(0.8, '#475569');
            g.addColorStop(1, '#0f172a');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = '#e0f2fe';
            ctx.fill();
        };
        drawReflector(160, 130, 75);
        drawReflector(340, 130, 65);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(30, 40);
        ctx.lineTo(480, 50);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(30, 40);
        ctx.lineTo(480, 50);
        ctx.stroke();
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
}
