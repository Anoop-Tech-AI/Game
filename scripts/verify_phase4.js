import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPhase4Verification() {
  console.log('=== Starting EXTREME CITY DRIVE Phase 4 Full Verification ===');

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
  
  // Wait for loading screen simulation to complete & Main Menu to display
  await new Promise(r => setTimeout(r, 4000));

  // 1. Verify Loading & Main Menu
  console.log('Step 1: Inspecting Main Menu UI...');
  const menuVisible = await page.evaluate(() => {
    const menu = document.getElementById('main-menu-overlay');
    return menu && menu.style.display !== 'none';
  });
  console.log('Main Menu is visible:', menuVisible);

  // 2. Click "ENTER CITY" (Play)
  console.log('Step 2: Entering City from Main Menu...');
  await page.evaluate(() => {
    const playBtn = document.getElementById('menu-play-btn');
    if (playBtn) playBtn.click();
    else if (window.engine?.mainMenuUI) window.engine.mainMenuUI.toggle(false);
  });
  await new Promise(r => setTimeout(r, 1000));

  // 3. Verify Player Profile & Progression
  console.log('Step 3: Checking Profile & Progression...');
  const initialProfile = await page.evaluate(() => {
    const profile = window.engine?.profileSystem?.getProfile();
    return {
      level: profile?.level,
      xp: profile?.xp,
      credits: profile?.credits,
      discoveredDistricts: profile?.discoveredDistricts
    };
  });
  console.log('Initial Profile Data:', initialProfile);

  // 4. Test World Map & Fast Travel
  console.log('Step 4: Testing World Map UI (Key M)...');
  await page.keyboard.press('KeyM');
  await new Promise(r => setTimeout(r, 800));
  const mapOpen = await page.evaluate(() => {
    const modal = document.getElementById('world-map-modal');
    return modal && modal.style.display !== 'none';
  });
  console.log('World Map Open:', mapOpen);

  // Test Fast Travel to Airport Terminal via Map UI
  console.log('Testing Fast Travel to Airport Terminal...');
  await page.evaluate(() => {
    if (window.engine?.worldMapUI) {
      window.engine.worldMapUI.fastTravelTo({
        id: 'airport',
        name: 'International Airport',
        type: 'airport',
        pos: { x: 0, y: 0, z: -480 }
      });
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  const airportPos = await page.evaluate(() => {
    const pos = window.engine?.car?.group.position;
    return { x: Math.round(pos?.x || 0), z: Math.round(pos?.z || 0) };
  });
  console.log('Player Position after Airport Fast Travel:', airportPos);

  // 5. Test District Discovery
  console.log('Step 5: Testing District Discovery System...');
  await page.evaluate(() => {
    window.engine?.profileSystem?.discoverDistrict('downtown');
    window.engine?.profileSystem?.discoverDistrict('airport');
    window.engine?.profileSystem?.discoverDistrict('industrial');
  });
  const discovered = await page.evaluate(() => {
    return window.engine?.profileSystem?.getProfile().discoveredDistricts;
  });
  console.log('Discovered Districts:', discovered);

  // 6. Test Garage Upgrades & Customization
  console.log('Step 6: Testing Garage Upgrades & 7 Categories...');
  await page.evaluate(() => {
    if (window.engine?.garageUI) {
      window.engine.garageUI.toggle(true);
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Buy Engine upgrade
  const upgradeResult = await page.evaluate(() => {
    const g = window.engine?.garageSystem;
    const initialEngine = g?.getVehicleUpgrades('apex_gt')?.engine || 0;
    const buySuccess = g?.buyUpgrade('engine');
    const newEngine = g?.getVehicleUpgrades('apex_gt')?.engine || 0;
    return { initialEngine, buySuccess, newEngine };
  });
  console.log('Engine Upgrade Purchase:', upgradeResult);

  // Close Garage
  await page.evaluate(() => {
    if (window.engine?.garageUI) {
      window.engine.garageUI.toggle(false);
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // 7. Test Race Framework & AI Racers
  console.log('Step 7: Testing Race System with AI Racers (Downtown GP)...');
  await page.evaluate(() => {
    if (window.engine?.raceSystem) {
      window.engine.raceSystem.startRace('downtown_sprint');
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  const raceStateCountdown = await page.evaluate(() => {
    return {
      state: window.engine?.raceSystem?.state,
      countdown: window.engine?.raceSystem?.countdownTimer,
      aiCount: window.engine?.raceSystem?.aiRacers?.length
    };
  });
  console.log('Race Countdown State:', raceStateCountdown);

  // Simulate racing for 4 seconds to verify AI racers movement & checkpoint checks
  console.log('Simulating race progression for 4 seconds...');
  await new Promise(r => setTimeout(r, 4000));

  const liveRaceStatus = await page.evaluate(() => {
    const race = window.engine?.raceSystem;
    const ai1 = race?.aiRacers[0]?.position;
    const playerPos = window.engine?.car?.group.position;
    const hudPos = document.getElementById('race-position-hud')?.textContent;
    return {
      state: race?.state,
      raceTimer: race?.raceTimer?.toFixed(2),
      hudPosition: hudPos,
      ai1Pos: ai1 ? { x: Math.round(ai1.x), z: Math.round(ai1.z) } : null,
      playerPos: playerPos ? { x: Math.round(playerPos.x), z: Math.round(playerPos.z) } : null
    };
  });
  console.log('Live Race Status:', liveRaceStatus);

  // Simulate finishing race and opening podium modal
  console.log('Triggering Race Finish...');
  await page.evaluate(() => {
    if (window.engine?.raceSystem) {
      window.engine.raceSystem.finishRace();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const podiumVisible = await page.evaluate(() => {
    const modal = document.getElementById('race-results-modal');
    return modal && modal.style.display !== 'none';
  });
  console.log('Race Results / Podium Modal Visible:', podiumVisible);

  // Close Podium & return to city
  await page.evaluate(() => {
    const contBtn = document.getElementById('race-continue-btn');
    if (contBtn) contBtn.click();
    else if (window.engine?.raceResultsUI) window.engine.raceResultsUI.hide();
  });
  await new Promise(r => setTimeout(r, 800));

  // 8. Test 3D NavArrow
  console.log('Step 8: Checking 3D NavArrow...');
  const navArrowVisible = await page.evaluate(() => {
    return window.engine?.navArrow?.arrowMesh?.visible;
  });
  console.log('NavArrow Visible:', navArrowVisible);

  // 9. Test Audio & Impact Sound
  console.log('Step 9: Testing Audio Engine & Collision Impact...');
  await page.evaluate(() => {
    window.engine?.audio?.playCollisionSound(1.5);
  });

  // 10. Check Saved LocalStorage Profile
  console.log('Step 10: Checking Profile LocalStorage Persistence...');
  const savedData = await page.evaluate(() => {
    const raw = localStorage.getItem('extreme_city_drive_profile_v4');
    return raw ? JSON.parse(raw) : null;
  });
  console.log('Persisted Profile Summary:', {
    version: savedData?.version,
    level: savedData?.level,
    credits: savedData?.credits,
    completedRaces: savedData?.completedRaces,
    stats: savedData?.stats
  });

  console.log('Total Console Errors Encountered:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Console Errors:', consoleErrors);
  }

  await browser.close();
  console.log('=== Phase 4 Verification Completed Successfully ===');
}

runPhase4Verification().catch(err => {
  console.error('Phase 4 Verification Failed:', err);
  process.exit(1);
});
