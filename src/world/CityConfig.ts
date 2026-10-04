export enum DistrictType {
    DOWNTOWN = 'DOWNTOWN',
    COMMERCIAL = 'COMMERCIAL',
    RESIDENTIAL = 'RESIDENTIAL',
    INDUSTRIAL = 'INDUSTRIAL',
    SUBURBAN = 'SUBURBAN'
}
export enum RoadCategory {
    HIGHWAY = 'HIGHWAY',
    MAJOR_AVENUE = 'MAJOR_AVENUE',
    BOULEVARD = 'BOULEVARD',
    RESIDENTIAL_STREET = 'RESIDENTIAL_STREET',
    INDUSTRIAL_ROAD = 'INDUSTRIAL_ROAD'
}
export const CITY_CONFIG = {
    GRID_INDICES: [-2, -1, 0, 1, 2],
    GRID_COLS: 5,
    GRID_ROWS: 5,
    WORLD_OFFSET_X: -220.0,
    WORLD_OFFSET_Z: -220.0,
    BLOCK_SIZE: 110.0,
    CITY_HALF_SIZE: 250.0,
    ROAD_WIDTH: {
        [RoadCategory.HIGHWAY]: 24.0,
        [RoadCategory.MAJOR_AVENUE]: 18.0,
        [RoadCategory.BOULEVARD]: 15.0,
        [RoadCategory.RESIDENTIAL_STREET]: 11.0,
        [RoadCategory.INDUSTRIAL_ROAD]: 16.0,
    },
    LANE_WIDTH: 3.6,
    SIDEWALK_WIDTH: 3.8,
    CURB_HEIGHT: 0.18,
    CURB_WIDTH: 0.28,
    BUILDING_SETBACK: 1.2,
    TRAFFIC_MAX_VEHICLES: 24,
    TRAFFIC_SPAWN_RADIUS: 130.0,
    TRAFFIC_DESPAWN_RADIUS: 180.0,
    TRAFFIC_SAFE_DISTANCE: 9.0,
    TRAFFIC_SPEED_LIMITS: {
        [RoadCategory.HIGHWAY]: 28.0,
        [RoadCategory.MAJOR_AVENUE]: 15.0,
        [RoadCategory.BOULEVARD]: 13.0,
        [RoadCategory.RESIDENTIAL_STREET]: 9.0,
        [RoadCategory.INDUSTRIAL_ROAD]: 11.0,
    },
    DISTRICT_DENSITY: {
        [DistrictType.DOWNTOWN]: 1.0,
        [DistrictType.COMMERCIAL]: 0.9,
        [DistrictType.RESIDENTIAL]: 0.5,
        [DistrictType.INDUSTRIAL]: 0.6,
        [DistrictType.SUBURBAN]: 0.35,
    }
};
export function getDistrictForPosition(x: number, z: number): DistrictType {
    if (Math.abs(x) < 70 && Math.abs(z) < 70)
        return DistrictType.DOWNTOWN;
    if (x > 50 && z > -80)
        return DistrictType.COMMERCIAL;
    if (z > 60 && x < 60)
        return DistrictType.RESIDENTIAL;
    if (z < -60 && x > -100)
        return DistrictType.INDUSTRIAL;
    return DistrictType.SUBURBAN;
}
export function getDistrictForBlock(colIndex: number, rowIndex: number): DistrictType {
    const x = (colIndex - 2) * CITY_CONFIG.BLOCK_SIZE;
    const z = (rowIndex - 2) * CITY_CONFIG.BLOCK_SIZE;
    return getDistrictForPosition(x, z);
}
