import * as THREE from 'three';

export class NavArrow {
    public group: THREE.Group;
    private arrowMesh: THREE.Mesh;
    private targetPos: THREE.Vector3 = new THREE.Vector3(55, 0, 0); // Default to Apex Garage
    private time: number = 0;

    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'NavArrow';

        const shape = new THREE.Shape();
        shape.moveTo(0, 0.9);
        shape.lineTo(0.55, -0.4);
        shape.lineTo(0.2, -0.2);
        shape.lineTo(0.2, -0.8);
        shape.lineTo(-0.2, -0.8);
        shape.lineTo(-0.2, -0.2);
        shape.lineTo(-0.55, -0.4);
        shape.closePath();

        const extrudeSettings = { depth: 0.14, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.rotateX(Math.PI / 2); // Lay flat facing forward (+Z)

        const mat = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        this.arrowMesh = new THREE.Mesh(geo, mat);
        this.group.add(this.arrowMesh);
    }

    public setTarget(target: THREE.Vector3 | null, colorHex: number = 0x00f5ff) {
        if (target) {
            this.targetPos.copy(target);
        } else {
            this.targetPos.set(55, 0, 0); // Apex Garage
        }
        (this.arrowMesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
    }

    public update(dt: number, carPos: THREE.Vector3) {
        this.time += dt;

        this.group.position.set(carPos.x, carPos.y + 2.75 + Math.sin(this.time * 4) * 0.12, carPos.z);

        const dx = this.targetPos.x - carPos.x;
        const dz = this.targetPos.z - carPos.z;
        const targetAngle = Math.atan2(dx, dz);

        this.arrowMesh.rotation.y = targetAngle;
    }
}
