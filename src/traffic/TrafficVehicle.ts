import * as THREE from 'three';
import { TrafficModelInstance, TrafficVehicleType, TrafficModels } from './TrafficModels';
import { RoadGraph, RoadSegment } from '../world/RoadGraph';
export enum TrafficState {
    CRUISE = 'CRUISE',
    FOLLOW = 'FOLLOW',
    BRAKE = 'BRAKE',
    STOP_AT_LIGHT = 'STOP_AT_LIGHT',
    TURNING = 'TURNING'
}
export class TrafficVehicle {
    public model: TrafficModelInstance;
    public type: TrafficVehicleType;
    public position: THREE.Vector3 = new THREE.Vector3();
    public forward: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    public speed: number = 0;
    public targetSpeed: number = 12;
    public heading: number = 0;
    public state: TrafficState = TrafficState.CRUISE;
    public isActive: boolean = false;
    public currentSegment: RoadSegment | null = null;
    public isForwardDirection: boolean = true;
    public currentLaneIndex: number = 0;
    public waypoints: THREE.Vector3[] = [];
    public currentWaypointIndex: number = 0;
    public nextIntersectionId: string = '';
    private wheelTravel: number = 0;
    constructor(type: TrafficVehicleType = 'sedan') {
        this.type = type;
        this.model = TrafficModels.createVehicle(type);
    }
    public spawn(segment: RoadSegment, isForward: boolean, laneIndex: number, progressRatio: number = 0) {
        this.currentSegment = segment;
        this.isForwardDirection = isForward;
        this.currentLaneIndex = laneIndex;
        const laneWaypoints = isForward
            ? segment.waypointsForward[laneIndex]
            : segment.waypointsBackward[laneIndex];
        if (!laneWaypoints || laneWaypoints.length < 2)
            return;
        this.waypoints = laneWaypoints;
        this.nextIntersectionId = isForward ? segment.endNodeId : segment.startNodeId;
        const startP = this.waypoints[0];
        const endP = this.waypoints[1];
        this.position.copy(startP).lerp(endP, progressRatio);
        const dir = new THREE.Vector3().subVectors(endP, startP).normalize();
        this.forward.copy(dir);
        this.heading = Math.atan2(dir.x, dir.z);
        this.targetSpeed = segment.speedLimit;
        this.speed = this.targetSpeed * (0.6 + Math.random() * 0.35);
        this.currentWaypointIndex = 1;
        this.isActive = true;
        this.updateTransform();
    }
    public update(dt: number, roadGraph: RoadGraph, otherVehicles: TrafficVehicle[], playerPos: THREE.Vector3) {
        if (!this.isActive || !this.currentSegment)
            return;
        if (dt > 0.1)
            dt = 0.1;
        let desiredSpeed = this.targetSpeed;
        let mustBrake = false;
        let minGapAhead = Infinity;
        otherVehicles.forEach(other => {
            if (other === this || !other.isActive)
                return;
            const toOther = new THREE.Vector3().subVectors(other.position, this.position);
            const dist = toOther.length();
            const dot = toOther.normalize().dot(this.forward);
            if (dist < 32.0 && dot > 0.85) {
                if (dist < minGapAhead) {
                    minGapAhead = dist;
                }
            }
        });
        const toPlayer = new THREE.Vector3().subVectors(playerPos, this.position);
        const distToPlayer = toPlayer.length();
        const dotPlayer = toPlayer.normalize().dot(this.forward);
        if (distToPlayer < 35.0 && dotPlayer > 0.82) {
            if (distToPlayer < minGapAhead) {
                minGapAhead = distToPlayer;
            }
        }
        const safeFollowGap = this.model.length + 8.5;
        if (minGapAhead < safeFollowGap * 2.2) {
            if (minGapAhead <= safeFollowGap) {
                desiredSpeed = 0;
                mustBrake = true;
                this.state = TrafficState.STOP_AT_LIGHT;
            }
            else {
                const gapFactor = (minGapAhead - safeFollowGap) / (safeFollowGap * 1.2);
                desiredSpeed = this.targetSpeed * Math.max(0.1, gapFactor);
                mustBrake = desiredSpeed < this.speed;
                this.state = TrafficState.FOLLOW;
            }
        }
        const targetNode = roadGraph.nodes.get(this.nextIntersectionId);
        if (targetNode) {
            const nodePos = new THREE.Vector3(targetNode.x, 0, targetNode.z);
            const distToJunction = this.position.distanceTo(nodePos);
            if (distToJunction < 24.0 && distToJunction > 4.0) {
                const signal = roadGraph.getSignalStateForDirection(this.nextIntersectionId, this.forward);
                if (signal === 'RED' || signal === 'YELLOW') {
                    desiredSpeed = 0;
                    mustBrake = true;
                    this.state = TrafficState.STOP_AT_LIGHT;
                }
            }
        }
        if (this.speed < desiredSpeed) {
            this.speed = Math.min(desiredSpeed, this.speed + 6.0 * dt);
        }
        else if (this.speed > desiredSpeed) {
            const decel = mustBrake ? 16.0 : 8.0;
            this.speed = Math.max(0, this.speed - decel * dt);
        }
        if (this.model.taillightMesh) {
            const isBraking = mustBrake && this.speed > 0.5;
            (this.model.taillightMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = isBraking ? 3.5 : 0.8;
        }
        if (this.waypoints.length > this.currentWaypointIndex) {
            const targetWp = this.waypoints[this.currentWaypointIndex];
            const toWp = new THREE.Vector3().subVectors(targetWp, this.position);
            const distToWp = toWp.length();
            if (distToWp > 0.2) {
                const targetAngle = Math.atan2(toWp.x, toWp.z);
                let angleDiff = targetAngle - this.heading;
                while (angleDiff > Math.PI)
                    angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI)
                    angleDiff += Math.PI * 2;
                this.heading += THREE.MathUtils.clamp(angleDiff * 5.0 * dt, -0.6 * dt * 5.0, 0.6 * dt * 5.0);
                this.forward.set(Math.sin(this.heading), 0, Math.cos(this.heading));
                const steerVisual = THREE.MathUtils.clamp(angleDiff * 1.5, -0.45, 0.45);
                this.model.frontPivots.forEach(p => {
                    p.rotation.y = steerVisual;
                });
            }
            if (distToWp < 3.5) {
                this.currentWaypointIndex++;
                if (this.currentWaypointIndex >= this.waypoints.length) {
                    this.transitionAtIntersection(roadGraph);
                }
            }
        }
        const moveDist = this.speed * dt;
        this.position.addScaledVector(this.forward, moveDist);
        this.wheelTravel += moveDist;
        const wheelRot = this.wheelTravel / 0.35;
        this.model.wheels.forEach(w => {
            w.rotation.x = wheelRot;
        });
        this.updateTransform();
    }
    private transitionAtIntersection(roadGraph: RoadGraph) {
        if (!this.currentSegment)
            return;
        const outgoing = roadGraph.getOutgoingSegments(this.nextIntersectionId, this.currentSegment.id);
        if (outgoing.length === 0) {
            this.isForwardDirection = !this.isForwardDirection;
            this.waypoints = this.isForwardDirection
                ? this.currentSegment.waypointsForward[0]
                : this.currentSegment.waypointsBackward[0];
            this.nextIntersectionId = this.isForwardDirection
                ? this.currentSegment.endNodeId
                : this.currentSegment.startNodeId;
            this.currentWaypointIndex = 0;
            return;
        }
        const nextSeg = outgoing[Math.floor(Math.random() * outgoing.length)];
        const isForward = nextSeg.startNodeId === this.nextIntersectionId;
        const laneIndex = 0;
        const laneWps = isForward ? nextSeg.waypointsForward[laneIndex] : nextSeg.waypointsBackward[laneIndex];
        if (laneWps && laneWps.length >= 2) {
            this.currentSegment = nextSeg;
            this.isForwardDirection = isForward;
            this.waypoints = laneWps;
            this.currentWaypointIndex = 0;
            this.nextIntersectionId = isForward ? nextSeg.endNodeId : nextSeg.startNodeId;
            this.targetSpeed = nextSeg.speedLimit;
        }
    }
    public updateTransform() {
        this.model.group.position.copy(this.position);
        this.model.group.rotation.y = this.heading;
    }
}
