import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPhase3Verification() {
  console.log('--- Starting EXTREME CITY DRIVE Phase 3 Full Verification ---');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const execPath = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--window-size=1280,720'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('Navigating to http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  const outDir = path.resolve(__dirname, '..', 'artifacts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const setPlayerTransform = async (x, z, heading) => {
    await page.evaluate((tx, tz, th) => {
      const engine = window.engine;
      if (engine && engine.carController) {
        engine.carController.resetPosition(tx, tz, th);
        engine.car.group.position.set(tx, 0, tz);
        engine.car.group.rotation.y = th;

        const camDist = 7.5;
        const camHeight = 3.2;
        const dx = -Math.sin(th) * camDist;
        const dz = -Math.cos(th) * camDist;

        engine.camera.position.set(tx + dx, camHeight, tz + dz);
        engine.camera.lookAt(tx, 1.2, tz);

        if (engine.cameraController) {
          engine.cameraController.currentCameraPos.set(tx + dx, camHeight, tz + dz);
          engine.cameraController.currentLookTarget.set(tx, 1.2, tz);
        }
      }
    }, x, z, heading);
    await new Promise(r => setTimeout(r, 1000));
  };

  // Test 1: Dynamic Rain Weather & Wet Reflective Asphalt
  console.log('Test 1: Dynamic Rain Weather (Key K)...');
  await page.evaluate(() => {
    window.engine?.weatherSystem?.setWeather('rain');
    window.engine?.hud?.setWeatherLabel('🌧️ RAIN');
  });
  await setPlayerTransform(0, -10, 0);
  await new Promise(r => setTimeout(r, 1200));
  const s1Path = path.join(outDir, 'phase3_01_rain_weather.png');
  await page.screenshot({ path: s1Path });
  console.log('Saved:', s1Path);

  // Test 2: Dense Atmospheric Fog
  console.log('Test 2: Atmospheric Fog...');
  await page.evaluate(() => {
    window.engine?.weatherSystem?.setWeather('fog');
    window.engine?.hud?.setWeatherLabel('🌫️ FOG');
  });
  await new Promise(r => setTimeout(r, 1200));
  const s2Path = path.join(outDir, 'phase3_02_atmospheric_fog.png');
  await page.screenshot({ path: s2Path });
  console.log('Saved:', s2Path);

  // Test 3: Clear Weather + Vehicle Fleet Showroom Model Switch (Vipera GTS Muscle Car)
  console.log('Test 3: Vehicle Fleet Model Switch (Vipera GTS)...');
  await page.evaluate(() => {
    window.engine?.weatherSystem?.setWeather('clear');
    window.engine?.hud?.setWeatherLabel('☀️ CLEAR');
    window.engine?.garageSystem?.selectVehicle('vipera_gts');
    window.engine?.car?.setModel('vipera_gts');
    window.engine?.car?.setPaint('#dc2626', 'metallic');
  });
  await new Promise(r => setTimeout(r, 800));
  const s3Path = path.join(outDir, 'phase3_03_muscle_car_model.png');
  await page.screenshot({ path: s3Path });
  console.log('Saved:', s3Path);

  // Test 4: Le Mans Prototype Phantom Hypercar with Dorsal Shark Fin
  console.log('Test 4: Phantom Hypercar with Dorsal Shark Fin...');
  await page.evaluate(() => {
    window.engine?.garageSystem?.selectVehicle('phantom');
    window.engine?.car?.setModel('phantom');
    window.engine?.car?.setPaint('#00f5ff', 'gloss');
  });
  await new Promise(r => setTimeout(r, 800));
  const s4Path = path.join(outDir, 'phase3_04_phantom_hypercar.png');
  await page.screenshot({ path: s4Path });
  console.log('Saved:', s4Path);

  // Test 5: Off-Road / Rally Runner AWD with Lifted Suspension & Roof Pods
  console.log('Test 5: Turbo Runner AWD with Lifted Suspension...');
  await page.evaluate(() => {
    window.engine?.garageSystem?.selectVehicle('runner_awd');
    window.engine?.car?.setModel('runner_awd');
    window.engine?.car?.setPaint('#f59e0b', 'matte');
  });
  await new Promise(r => setTimeout(r, 800));
  const s5Path = path.join(outDir, 'phase3_05_runner_awd.png');
  await page.screenshot({ path: s5Path });
  console.log('Saved:', s5Path);

  // Test 6: In-Game Settings & Graphics Quality Modal
  console.log('Test 6: Opening Settings & Graphics Quality Modal (Key ESC / O)...');
  await page.keyboard.press('KeyO');
  await new Promise(r => setTimeout(r, 800));
  const s6Path = path.join(outDir, 'phase3_06_settings_modal.png');
  await page.screenshot({ path: s6Path });
  console.log('Saved:', s6Path);
  await page.keyboard.press('KeyO');
  await new Promise(r => setTimeout(r, 500));

  // Test 7: Central Botanical Park & Walking Pedestrians
  console.log('Test 7: Central Botanical Park with Walking Pedestrians...');
  await setPlayerTransform(-120, -10, 0);
  await new Promise(r => setTimeout(r, 1200));
  const s7Path = path.join(outDir, 'phase3_07_park_pedestrians.png');
  await page.screenshot({ path: s7Path });
  console.log('Saved:', s7Path);

  // Test 8: Active Hazard Lights & Braking Visuals
  console.log('Test 8: Hazard Lights & Brake Lights...');
  await page.evaluate(() => {
    window.engine?.car?.toggleHazards();
    window.engine?.car?.setBrakingVisual(true);
  });
  await new Promise(r => setTimeout(r, 800));
  const s8Path = path.join(outDir, 'phase3_08_hazards_and_lighting.png');
  await page.screenshot({ path: s8Path });
  console.log('Saved:', s8Path);

  // Telemetry check
  const telemetry = await page.evaluate(() => {
    return {
      cash: document.getElementById('hud-cash-val')?.textContent,
      rep: document.getElementById('hud-rep-val')?.textContent,
      speed: document.getElementById('speed-val')?.textContent,
      district: document.getElementById('district-label')?.textContent,
      weather: document.getElementById('weather-indicator')?.textContent,
      carModel: window.engine?.car?.currentModelId,
      hazards: window.engine?.car?.hazardActive,
      pedestrians: window.engine?.cityWorld?.pedestrianSystem ? 'ACTIVE' : 'NONE'
    };
  });

  console.log('Phase 3 Final Telemetry:', telemetry);
  console.log('Console Errors Count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }

  await browser.close();
  console.log('--- Phase 3 Verification completed successfully ---');
}

runPhase3Verification().catch(err => {
  console.error('Phase 3 Verification Failed:', err);
  process.exit(1);
});
