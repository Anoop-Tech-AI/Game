import * as THREE from 'three';
interface PedestrianAgent {
    group: THREE.Group;
    legL: THREE.Mesh;
    legR: THREE.Mesh;
    armL: THREE.Mesh;
    armR: THREE.Mesh;
    pathStart: THREE.Vector3;
    pathEnd: THREE.Vector3;
    progress: number;
    speed: number;
    direction: number;
    idleTimer: number;
    walkCycle: number;
}
export class PedestrianSystem {
    public group: THREE.Group;
    private pedestrians: PedestrianAgent[] = [];
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'PedestrianSystem';
        this.spawnPedestrians();
    }
    private spawnPedestrians() {
        const shirtColors = [
            0x2563eb, 0xdc2626, 0x16a34a, 0xf59e0b, 0x8b5cf6,
            0xec4899, 0xffffff, 0x0f172a, 0x0284c7, 0x475569
        ];
        const pantsColors = [0x1e293b, 0x334155, 0x475569, 0x1e3a8a, 0x0f172a];
        const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const torsoGeo = new THREE.BoxGeometry(0.32, 0.44, 0.2);
        const limbGeo = new THREE.BoxGeometry(0.1, 0.45, 0.1);
        limbGeo.translate(0, -0.225, 0);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.6 });
        const routes: {
            start: [
                number,
                number
            ];
            end: [
                number,
                number
            ];
            count: number;
        }[] = [
            { start: [-12.5, -70], end: [-12.5, 70], count: 8 },
            { start: [12.5, -70], end: [12.5, 70], count: 8 },
            { start: [-55, -12.5], end: [55, -12.5], count: 8 },
            { start: [-55, 12.5], end: [55, 12.5], count: 8 },
            { start: [-125, -25], end: [-125, 25], count: 5 },
            { start: [-145, -20], end: [-145, 20], count: 5 },
            { start: [-130, 0], end: [-160, 0], count: 4 },
            { start: [-130, 95], end: [-170, 95], count: 5 },
            { start: [90, -108], end: [140, -108], count: 5 }
        ];
        routes.forEach(r => {
            for (let i = 0; i < r.count; i++) {
                const pedGroup = new THREE.Group();
                const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
                const pantsColor = pantsColors[Math.floor(Math.random() * pantsColors.length)];
                const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
                const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
                const head = new THREE.Mesh(headGeo, headMat);
                head.position.set(0, 1.48, 0);
                pedGroup.add(head);
                const torso = new THREE.Mesh(torsoGeo, shirtMat);
                torso.position.set(0, 1.15, 0);
                pedGroup.add(torso);
                const armL = new THREE.Mesh(limbGeo, shirtMat);
                armL.position.set(-0.22, 1.34, 0);
                pedGroup.add(armL);
                const armR = new THREE.Mesh(limbGeo, shirtMat);
                armR.position.set(0.22, 1.34, 0);
                pedGroup.add(armR);
                const legL = new THREE.Mesh(limbGeo, pantsMat);
                legL.position.set(-0.1, 0.9, 0);
                pedGroup.add(legL);
                const legR = new THREE.Mesh(limbGeo, pantsMat);
                legR.position.set(0.1, 0.9, 0);
                pedGroup.add(legR);
                const pStart = new THREE.Vector3(r.start[0], 0, r.start[1]);
                const pEnd = new THREE.Vector3(r.end[0], 0, r.end[1]);
                const initialProgress = Math.random();
                pedGroup.position.lerpVectors(pStart, pEnd, initialProgress);
                this.group.add(pedGroup);
                this.pedestrians.push({
                    group: pedGroup,
                    legL,
                    legR,
                    armL,
                    armR,
                    pathStart: pStart,
                    pathEnd: pEnd,
                    progress: initialProgress,
                    speed: 1.1 + Math.random() * 0.4,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    idleTimer: 0,
                    walkCycle: Math.random() * Math.PI * 2
                });
            }
        });
    }
    public update(dt: number, playerPos: THREE.Vector3) {
        const maxDistanceSq = 140 * 140;
        for (const ped of this.pedestrians) {
            const distSq = ped.group.position.distanceToSquared(playerPos);
            if (distSq > maxDistanceSq) {
                ped.group.visible = false;
                continue;
            }
            ped.group.visible = true;
            if (ped.idleTimer > 0) {
                ped.idleTimer -= dt;
                ped.legL.rotation.x = 0;
                ped.legR.rotation.x = 0;
                ped.armL.rotation.x = 0;
                ped.armR.rotation.x = 0;
                continue;
            }
            const pathLength = ped.pathStart.distanceTo(ped.pathEnd);
            const deltaProgress = (ped.speed / Math.max(1, pathLength)) * dt;
            ped.progress += deltaProgress * ped.direction;
            if (ped.progress >= 1.0) {
                ped.progress = 1.0;
                ped.direction = -1;
                if (Math.random() > 0.6)
                    ped.idleTimer = 2.0 + Math.random() * 3.0;
            }
            else if (ped.progress <= 0.0) {
                ped.progress = 0.0;
                ped.direction = 1;
                if (Math.random() > 0.6)
                    ped.idleTimer = 2.0 + Math.random() * 3.0;
            }
            ped.group.position.lerpVectors(ped.pathStart, ped.pathEnd, ped.progress);
            const targetDir = ped.direction === 1
                ? ped.pathEnd.clone().sub(ped.pathStart).normalize()
                : ped.pathStart.clone().sub(ped.pathEnd).normalize();
            const targetAngle = Math.atan2(targetDir.x, targetDir.z);
            ped.group.rotation.y = targetAngle;
            ped.walkCycle += dt * 6.5;
            const swing = Math.sin(ped.walkCycle) * 0.45;
            ped.legL.rotation.x = swing;
            ped.legR.rotation.x = -swing;
            ped.armL.rotation.x = -swing * 0.8;
            ped.armR.rotation.x = swing * 0.8;
        }
    }
}
