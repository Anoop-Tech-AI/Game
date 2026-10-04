import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';
export class Materials {
    public static asphalt: THREE.MeshStandardMaterial;
    public static roadMarkings: THREE.MeshStandardMaterial;
    public static crosswalk: THREE.MeshStandardMaterial;
    public static curb: THREE.MeshStandardMaterial;
    public static sidewalk: THREE.MeshStandardMaterial;
    public static tactilePaving: THREE.MeshStandardMaterial;
    public static manhole: THREE.MeshStandardMaterial;
    public static stormDrain: THREE.MeshStandardMaterial;
    public static modernGlassBuilding: THREE.MeshPhysicalMaterial;
    public static apartmentBuilding: THREE.MeshStandardMaterial;
    public static brickBuilding: THREE.MeshStandardMaterial;
    public static corporateBuilding: THREE.MeshStandardMaterial;
    public static roofGravel: THREE.MeshStandardMaterial;
    public static roofEquipmentMetal: THREE.MeshStandardMaterial;
    public static darkSteel: THREE.MeshStandardMaterial;
    public static trafficPoleYellow: THREE.MeshStandardMaterial;
    public static trafficSignalHousing: THREE.MeshStandardMaterial;
    public static signalRed: THREE.MeshStandardMaterial;
    public static signalAmber: THREE.MeshStandardMaterial;
    public static signalGreen: THREE.MeshStandardMaterial;
    public static fireHydrantRed: THREE.MeshPhysicalMaterial;
    public static brass: THREE.MeshStandardMaterial;
    public static benchWood: THREE.MeshStandardMaterial;
    public static glassShelter: THREE.MeshPhysicalMaterial;
    public static treeBark: THREE.MeshStandardMaterial;
    public static treeFoliage: THREE.MeshStandardMaterial;
    public static shrubFoliage: THREE.MeshStandardMaterial;
    public static soil: THREE.MeshStandardMaterial;
    public static carBodyPaint: THREE.MeshPhysicalMaterial;
    public static carTintedGlass: THREE.MeshPhysicalMaterial;
    public static carCarbonFiber: THREE.MeshStandardMaterial;
    public static carChrome: THREE.MeshStandardMaterial;
    public static carTireRubber: THREE.MeshStandardMaterial;
    public static carWheelAlloy: THREE.MeshStandardMaterial;
    public static carBrakeDisc: THREE.MeshStandardMaterial;
    public static carBrakeCaliper: THREE.MeshPhysicalMaterial;
    public static carHeadlightCluster: THREE.MeshStandardMaterial;
    public static carHeadlightGlass: THREE.MeshPhysicalMaterial;
    public static carTaillightRed: THREE.MeshPhysicalMaterial;
    public static carTaillightLit: THREE.MeshStandardMaterial;
    public static carInteriorTrim: THREE.MeshStandardMaterial;
    public static carMirrorGlass: THREE.MeshStandardMaterial;
    public static init() {
        const asphaltTex = TextureGenerator.createAsphaltTexture();
        asphaltTex.map.repeat.set(4, 16);
        asphaltTex.normalMap.repeat.set(4, 16);
        asphaltTex.roughnessMap.repeat.set(4, 16);
        this.asphalt = new THREE.MeshStandardMaterial({
            map: asphaltTex.map,
            normalMap: asphaltTex.normalMap,
            roughnessMap: asphaltTex.roughnessMap,
            roughness: 0.82,
            metalness: 0.08
        });
        const markingsTex = TextureGenerator.createRoadMarkingsTexture();
        markingsTex.repeat.set(1, 4);
        this.roadMarkings = new THREE.MeshStandardMaterial({
            map: markingsTex,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1.0,
            polygonOffsetUnits: -1.0,
            roughness: 0.55,
            metalness: 0.05
        });
        const crosswalkTex = TextureGenerator.createCrosswalkTexture();
        this.crosswalk = new THREE.MeshStandardMaterial({
            map: crosswalkTex,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1.2,
            polygonOffsetUnits: -1.2,
            roughness: 0.55
        });
        this.curb = new THREE.MeshStandardMaterial({
            color: 0xb0b3b8,
            roughness: 0.72,
            metalness: 0.08
        });
        const sidewalkTex = TextureGenerator.createSidewalkTexture();
        sidewalkTex.map.repeat.set(2, 20);
        sidewalkTex.normalMap.repeat.set(2, 20);
        this.sidewalk = new THREE.MeshStandardMaterial({
            map: sidewalkTex.map,
            normalMap: sidewalkTex.normalMap,
            roughness: 0.76,
            metalness: 0.05
        });
        const tactileTex = TextureGenerator.createTactilePavingTexture();
        tactileTex.repeat.set(2, 4);
        this.tactilePaving = new THREE.MeshStandardMaterial({
            map: tactileTex,
            roughness: 0.65,
            metalness: 0.1
        });
        const manholeTex = TextureGenerator.createManholeTexture();
        this.manhole = new THREE.MeshStandardMaterial({
            map: manholeTex.map,
            normalMap: manholeTex.normalMap,
            roughness: 0.58,
            metalness: 0.78,
            polygonOffset: true,
            polygonOffsetFactor: -1.5,
            polygonOffsetUnits: -1.5
        });
        const stormDrainTex = TextureGenerator.createStormDrainTexture();
        this.stormDrain = new THREE.MeshStandardMaterial({
            map: stormDrainTex,
            roughness: 0.52,
            metalness: 0.82,
            polygonOffset: true,
            polygonOffsetFactor: -1.5,
            polygonOffsetUnits: -1.5
        });
        const modernGlassTex = TextureGenerator.createBuildingFacadeTexture('modern_glass');
        modernGlassTex.map.repeat.set(2, 3);
        modernGlassTex.emissiveMap.repeat.set(2, 3);
        this.modernGlassBuilding = new THREE.MeshPhysicalMaterial({
            map: modernGlassTex.map,
            emissiveMap: modernGlassTex.emissiveMap,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.25,
            roughness: 0.12,
            metalness: 0.55,
            clearcoat: 0.85,
            clearcoatRoughness: 0.08,
            reflectivity: 0.95
        });
        const aptTex = TextureGenerator.createBuildingFacadeTexture('apartment');
        aptTex.map.repeat.set(2, 2);
        aptTex.emissiveMap.repeat.set(2, 2);
        this.apartmentBuilding = new THREE.MeshStandardMaterial({
            map: aptTex.map,
            emissiveMap: aptTex.emissiveMap,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.2,
            roughness: 0.72,
            metalness: 0.12
        });
        const brickTex = TextureGenerator.createBuildingFacadeTexture('brick');
        brickTex.map.repeat.set(3, 3);
        brickTex.emissiveMap.repeat.set(3, 3);
        this.brickBuilding = new THREE.MeshStandardMaterial({
            map: brickTex.map,
            emissiveMap: brickTex.emissiveMap,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.18,
            roughness: 0.82,
            metalness: 0.08
        });
        const corpTex = TextureGenerator.createBuildingFacadeTexture('corporate');
        corpTex.map.repeat.set(2, 4);
        corpTex.emissiveMap.repeat.set(2, 4);
        this.corporateBuilding = new THREE.MeshStandardMaterial({
            map: corpTex.map,
            emissiveMap: corpTex.emissiveMap,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.22,
            roughness: 0.35,
            metalness: 0.55
        });
        this.roofGravel = new THREE.MeshStandardMaterial({
            color: 0x33373d,
            roughness: 0.9,
            metalness: 0.1
        });
        this.roofEquipmentMetal = new THREE.MeshStandardMaterial({
            color: 0x717986,
            roughness: 0.42,
            metalness: 0.78
        });
        this.darkSteel = new THREE.MeshStandardMaterial({
            color: 0x242831,
            roughness: 0.35,
            metalness: 0.85
        });
        this.trafficPoleYellow = new THREE.MeshStandardMaterial({
            color: 0xeab308,
            roughness: 0.4,
            metalness: 0.2
        });
        this.trafficSignalHousing = new THREE.MeshStandardMaterial({
            color: 0x14171d,
            roughness: 0.5,
            metalness: 0.3
        });
        this.signalRed = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xff1e1e,
            emissiveIntensity: 2.5,
            roughness: 0.2
        });
        this.signalAmber = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xffa000,
            emissiveIntensity: 0.1,
            roughness: 0.2
        });
        this.signalGreen = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x00ff88,
            emissiveIntensity: 0.1,
            roughness: 0.2
        });
        this.fireHydrantRed = new THREE.MeshPhysicalMaterial({
            color: 0xdc2626,
            roughness: 0.25,
            metalness: 0.3,
            clearcoat: 0.75
        });
        this.brass = new THREE.MeshStandardMaterial({
            color: 0xd97706,
            roughness: 0.2,
            metalness: 0.9
        });
        this.benchWood = new THREE.MeshStandardMaterial({
            color: 0x854d0e,
            roughness: 0.68,
            metalness: 0.05
        });
        this.glassShelter = new THREE.MeshPhysicalMaterial({
            color: 0xe0f2fe,
            transmission: 0.85,
            transparent: true,
            opacity: 0.85,
            roughness: 0.08,
            ior: 1.5
        });
        this.treeBark = new THREE.MeshStandardMaterial({
            color: 0x443328,
            roughness: 0.9,
            metalness: 0.05
        });
        this.treeFoliage = new THREE.MeshStandardMaterial({
            color: 0x2d7a3e,
            roughness: 0.62,
            metalness: 0.05,
            side: THREE.DoubleSide
        });
        this.shrubFoliage = new THREE.MeshStandardMaterial({
            color: 0x1e824c,
            roughness: 0.58,
            side: THREE.DoubleSide
        });
        this.soil = new THREE.MeshStandardMaterial({
            color: 0x2b221a,
            roughness: 0.95
        });
        this.carBodyPaint = new THREE.MeshPhysicalMaterial({
            color: 0xd61c28,
            metalness: 0.82,
            roughness: 0.14,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            reflectivity: 0.98
        });
        this.carTintedGlass = new THREE.MeshPhysicalMaterial({
            color: 0x0c1522,
            transmission: 0.7,
            transparent: true,
            opacity: 0.84,
            roughness: 0.05,
            ior: 1.52
        });
        const carbonTex = TextureGenerator.createCarbonFiberTexture();
        this.carCarbonFiber = new THREE.MeshStandardMaterial({
            map: carbonTex,
            roughness: 0.25,
            metalness: 0.35
        });
        this.carChrome = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            metalness: 0.98,
            roughness: 0.06
        });
        const tireNormal = TextureGenerator.createTireTreadTexture();
        this.carTireRubber = new THREE.MeshStandardMaterial({
            color: 0x16181b,
            normalMap: tireNormal,
            roughness: 0.82,
            metalness: 0.04
        });
        this.carWheelAlloy = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            metalness: 0.92,
            roughness: 0.18
        });
        const brakeTex = TextureGenerator.createBrakeDiscTexture();
        this.carBrakeDisc = new THREE.MeshStandardMaterial({
            map: brakeTex,
            metalness: 0.86,
            roughness: 0.28
        });
        this.carBrakeCaliper = new THREE.MeshPhysicalMaterial({
            color: 0xfacc15,
            metalness: 0.35,
            roughness: 0.18,
            clearcoat: 0.9
        });
        const hlClusterTex = TextureGenerator.createHeadlightClusterTexture();
        this.carHeadlightCluster = new THREE.MeshStandardMaterial({
            map: hlClusterTex,
            roughness: 0.12,
            metalness: 0.75
        });
        this.carHeadlightGlass = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.92,
            transparent: true,
            opacity: 0.65,
            roughness: 0.03,
            ior: 1.5
        });
        this.carTaillightRed = new THREE.MeshPhysicalMaterial({
            color: 0xcc0000,
            emissive: 0x660000,
            roughness: 0.12,
            clearcoat: 0.9
        });
        this.carTaillightLit = new THREE.MeshStandardMaterial({
            color: 0xff2233,
            emissive: 0xff001a,
            emissiveIntensity: 3.8,
            roughness: 0.08
        });
        this.carInteriorTrim = new THREE.MeshStandardMaterial({
            color: 0x121418,
            roughness: 0.82,
            metalness: 0.05
        });
        this.carMirrorGlass = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.02
        });
    }
}
