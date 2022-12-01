import { environment } from "../../Environment/environment";
import { app, SETTINGS} from "../../main";
import { generateDirectPath } from "../../Utilities/generateDirectPath";
import { getAngle } from "../../Utilities/getAngle";
import { getDistance } from "../../Utilities/getDistance";
import { getNextPosition } from "../../Utilities/getNextPosition";
import { FOV, PLAYER_HIT_BOX, SPEED } from "../player";
import * as _ from 'lodash'

export enum RaycastTypes {
    SPRAY = 'SPRAY',
    CORNERS = 'CORNERS'
}

// The Web Work Version
import MyWorker from './worker?worker'
export const RaycastWorker = new MyWorker();
export function generate2dRaycast(data : RaycastWorkerData) {
    if (RaycastWorker){
        RaycastWorker.postMessage({ messageType: 'RAY_CAST', payload: data});
        // @ts-ignore
        RaycastWorker.onmessage = (e) => {
            const fogOfWar = document.getElementById('fog-of-war');
            if (fogOfWar) {
                window.requestAnimationFrame(() => {
                    fogOfWar.style.clipPath = `${e.data}`
                })
            }
        }
    }
}

// The Original Version
export function generateRayCast(playerInfo : player_info, config : raycast_config ) {

    let lowerLimit = playerInfo.current_position.rotation - 90 - FOV;
    let upperLimit = playerInfo.current_position.rotation - 90 + FOV;
    let lowerLimitPath = getIntersectingPath(playerInfo.current_position.x, playerInfo.current_position.y, SPEED, lowerLimit, environment.collissions,`ray-lower`);
    let upperLimitPath = getIntersectingPath(playerInfo.current_position.x, playerInfo.current_position.y, SPEED, upperLimit, environment.collissions,`ray-upper`);

    let lowerLimitCoords = lowerLimitPath[lowerLimitPath.length - 1]
    let upperLimitCoords = upperLimitPath[upperLimitPath.length - 1]

    let startOfRaycastPath = []
    startOfRaycastPath.push({ x: playerInfo.current_position.x + 22, y: playerInfo.current_position.y + 22 });
    startOfRaycastPath.push({ x: lowerLimitCoords.x + 22, y: lowerLimitCoords.y + 22 });

    // @ts-ignore
    let raycastPath = [];
    if (config.type === 'CORNERS') {
        const allCorners = {} as CollissionMap
        Object.keys(environment.corners).forEach( collish => {
            let [ x, y ] = collish.split(',');
            let collision_config = environment.corners[collish];

            const angleToCorner = getAngle(playerInfo.current_position.x, playerInfo.current_position.y, Number(x), Number(y));
            collision_config.angleFromPlayer = angleToCorner;
            collision_config.isVisible = angleToCorner > lowerLimit && angleToCorner < upperLimit;

            allCorners[collish] = _.cloneDeep(collision_config);
        });
        
        Object.keys(allCorners).forEach((cornerCoord) => {
            let [ x, y ] = cornerCoord.split(',');
            let collision_config = allCorners[cornerCoord];

            let path = generateDirectPath({
                x: playerInfo.current_position.x,
                y: playerInfo.current_position.y
            },{
                x: Number(x),
                y: Number(y)
            }, environment.collissions);

            // Send a ray -1 degree from current corner
            if (collision_config.isVisible && collision_config.angleFromPlayer) {
                let oneUp = getIntersectingPath(
                    playerInfo.current_position.x,
                    playerInfo.current_position.y, 
                    SPEED, 
                    Math.floor(collision_config.angleFromPlayer) - SPEED, 
                    environment.collissions,
                    `ray-123`, 
                );
                let oneDown = getIntersectingPath(
                    playerInfo.current_position.x,
                    playerInfo.current_position.y, 
                    SPEED, 
                    Math.floor(collision_config.angleFromPlayer) + SPEED, 
                    environment.collissions,
                    `ray-123`, 
                );

                let oneUpCoords = oneUp[oneUp.length - 1]
                let oneDownCoords = oneDown[oneDown.length - 1]

                raycastPath.push({ x: oneUpCoords.x, y: oneUpCoords.y, d: Math.floor(collision_config.angleFromPlayer) - 5})
                raycastPath.push({ x: oneDownCoords.x, y: oneDownCoords.y, d: Math.floor(collision_config.angleFromPlayer) + 5})
            }

            // Send a ray +1 degree from the current corner

            if (collision_config.isVisible) {
                let lastCoord = path[path.length - 1];
                raycastPath.push({ x: lastCoord.x, y: lastCoord.y, d: collision_config.angleFromPlayer})
            }

            if (SETTINGS.debug) {
                drawRay(path, `corner-${x}-${y}`, collision_config.isVisible, 'corner');
            }

        });
    } else if (config.type === 'SPRAY') {

        for (let i = lowerLimit; i < upperLimit; i += 10) {
            const degree = i;
            let path = getIntersectingPath(
                playerInfo.current_position.x,
                playerInfo.current_position.y, 
                SPEED, 
                Math.floor(degree),
                environment.collissions,
                `ray-123`, 
            );
            let coords = path[path.length - 1]
            startOfRaycastPath.push({ x: coords.x, y: coords.y, d: Math.floor(degree) });
        }

    }

    let endOfRaycastPath = []
    endOfRaycastPath.push({ x: upperLimitCoords.x + 22, y: upperLimitCoords.y + 22 });
    endOfRaycastPath.push({ x: playerInfo.current_position.x + 22, y: playerInfo.current_position.y + 22 });

    // @ts-ignore
    raycastPath = _.orderBy(raycastPath, 'd', 'asc');

    raycastPath = [...startOfRaycastPath, ...raycastPath, ...endOfRaycastPath]

    let polygonPath = 'polygon(';
    for (let i = 0; i < raycastPath.length; i++) {
        // @ts-ignore
        const raypoint = raycastPath[i];
        if (i === raycastPath.length - 1) {
            polygonPath += `${raypoint.x}px ${raypoint.y}px`
        } else {
            polygonPath += `${raypoint.x}px ${raypoint.y}px,`
        }
        
    }
    polygonPath += ')';

    const fogOfWar = document.getElementById('fog-of-war');
    if (fogOfWar) {
        window.requestAnimationFrame(() => {
            fogOfWar.style.clipPath = polygonPath
        })
    }

    return;
}

export function getIntersectingPath(sourceX : number, sourceY : number, speed: number, angle : number,  collisions: CollissionMap, identifier? : string) {
    let xypath = [] as coordinates[]
    let collided = true;

    let max = 2500;
    let i = 0;

    while(collided) {
        i++;

        let nextPosition = getNextPosition(sourceX, sourceY, speed, angle);
        xypath.push(nextPosition);

        sourceX = nextPosition.x;
        sourceY = nextPosition.y;

        if (sourceX < environment.limits.left - PLAYER_HIT_BOX / 2) {
            sourceX = environment.limits.left - PLAYER_HIT_BOX / 2;
            collided = false;
        }
        
        if (sourceX > environment.limits.right - PLAYER_HIT_BOX / 2) {
            sourceX = environment.limits.right - PLAYER_HIT_BOX / 2;
            collided = false;
        }
    
        if (sourceY < environment.limits.top - PLAYER_HIT_BOX / 2) {
            sourceY = environment.limits.top - PLAYER_HIT_BOX / 2;
            collided = false;
        }
    
        if (sourceY > environment.limits.bottom - PLAYER_HIT_BOX / 2) {
            sourceY = environment.limits.bottom - PLAYER_HIT_BOX / 2;
            collided = false;
        }

        let justBefore = collisions[`${Math.floor(sourceX) - 1},${Math.floor(sourceY) - 1}`]
        let onTheMark = collisions[`${Math.floor(sourceX)},${Math.floor(sourceY)}`]
        let justAfter = collisions[`${Math.floor(sourceX) + 1},${Math.floor(sourceY) + 1}`]
        if (justBefore || onTheMark || justAfter) {
            collided = false;
        } 

        if (i > max) collided = false;
    }

    if (identifier) {
        // drawRay(xypath, identifier, true)
    }

    return xypath;
}

function drawRay(path : coordinates[], identifier : string, visible: boolean, type?: string) {
    const existingRay = document.getElementById(`ray-${identifier}`);

    const startingPoint = path[0];
    const targetPoint = path[path.length - 1];
    const angleToTarget = getAngle(startingPoint.x, startingPoint.y, targetPoint.x, targetPoint.y);
    const distance = getDistance(startingPoint.x, startingPoint.y, targetPoint.x, targetPoint.y) + 22;
    
    if (!existingRay) { 
        const newRayEntity = window.document.createElement('div');
        const newRayIdentifier = identifier

        newRayEntity.id = `ray-${newRayIdentifier}`;
        newRayEntity.setAttribute('data-visible', `${visible}`);
        newRayEntity.classList.add(`ray`);
        newRayEntity.setAttribute('data-ray-id', `${newRayIdentifier}`);
        
        newRayEntity.style.width = `${distance}px`;
        newRayEntity.style.transform = `translate3d(${startingPoint.x + 22}px, ${startingPoint.y + 22}px, 0) rotate(${angleToTarget}deg)`;
        
        if (type !== undefined) {
            newRayEntity.classList.add(type);
        }

        app.appendChild(newRayEntity);
    } else {
        existingRay.setAttribute('data-visible', `${visible}`);
        existingRay.style.width = `${distance}px`;
        existingRay.style.transform = `translate3d(${startingPoint.x + 22}px, ${startingPoint.y + 22}px, 0) rotate(${angleToTarget}deg)`;
    }

    return;
}

