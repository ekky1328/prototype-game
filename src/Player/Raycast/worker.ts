import * as _ from 'lodash'

let environment = { 
    limits: {
        left : 0,
        right : 3000,
        top : 0,
        bottom : 3000,
    },
} as Environment;

onmessage = (e: MessageEvent)  => {
    if (e.data.messageType === 'ENVIRONMENT') {
        environment = e.data.payload;
        return;
    }

    if (e.data.messageType === 'RAY_CAST') {
        const polygonPath = generateRayCast(e.data.payload);
        postMessage(polygonPath)
        return;
    }

    return;
}

function generateRayCast(data: RaycastWorkerData) : string {

    const { 
        player_info : playerInfo, 
        raycast_config: config, 
        SPEED, 
        FOV,
        PLAYER_HIT_BOX
    } = data;

    let lowerLimit = playerInfo.current_position.rotation - 90 - FOV;
    let upperLimit = playerInfo.current_position.rotation - 90 + FOV;
    let lowerLimitPath = getIntersectingPath(playerInfo.current_position.x, playerInfo.current_position.y, SPEED, lowerLimit, environment, PLAYER_HIT_BOX, `ray-lower`);
    let upperLimitPath = getIntersectingPath(playerInfo.current_position.x, playerInfo.current_position.y, SPEED, upperLimit, environment, PLAYER_HIT_BOX, `ray-upper`);

    let lowerLimitCoords = lowerLimitPath[lowerLimitPath.length - 1]
    let upperLimitCoords = upperLimitPath[upperLimitPath.length - 1]

    let startOfRaycastPath = []
    startOfRaycastPath.push({ x: playerInfo.current_position.x + 22, y: playerInfo.current_position.y + 22 });
    startOfRaycastPath.push({ x: lowerLimitCoords.x + 22, y: lowerLimitCoords.y + 22 });

    // @ts-ignore
    let raycastPath = [];
    if (config.type === 'CORNERS') { 
        const allCorners = {} as CollissionMap
        Object.keys(environment.collissions).forEach( collish => {
            let [ x, y ] = collish.split(',');
            let collision_config = environment.collissions[collish];

            const angleToCorner = getAngle(playerInfo.current_position.x, playerInfo.current_position.y, Number(x), Number(y));
            collision_config.angleFromPlayer = angleToCorner;
            collision_config.isVisible = angleToCorner > lowerLimit && angleToCorner < upperLimit;

            if (collision_config.isCorner) {
                allCorners[collish] = _.cloneDeep(collision_config);
            }
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
                    Math.floor(collision_config.angleFromPlayer) - 5, 
                    environment,
                    PLAYER_HIT_BOX,
                    `ray-123`, 
                );
                let oneDown = getIntersectingPath(
                    playerInfo.current_position.x,
                    playerInfo.current_position.y, 
                    SPEED, 
                    Math.floor(collision_config.angleFromPlayer) + 5, 
                    environment,
                    PLAYER_HIT_BOX,
                    `ray-123`, 
                );

                let oneUpCoords = oneUp[oneUp.length - 1]
                let oneDownCoords = oneDown[oneDown.length - 1]

                raycastPath.push({ x: oneUpCoords.x, y: oneUpCoords.y, d: Math.floor(collision_config.angleFromPlayer) - 5})
                raycastPath.push({ x: oneDownCoords.x, y: oneDownCoords.y, d: Math.floor(collision_config.angleFromPlayer) + 5})
            }

            if (collision_config.isVisible) {
                let lastCoord = path[path.length - 1];
                raycastPath.push({ x: lastCoord.x, y: lastCoord.y, d: collision_config.angleFromPlayer})
            }
        });
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

    return polygonPath;
}

function getIntersectingPath(sourceX : number, sourceY : number, speed: number, angle : number, environment: Environment, PLAYER_HIT_BOX : number, identifier? : string) {
    
    let collisions = environment.collissions
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

function generateDirectPath(sourceCoords : coordinates, targetCoords : coordinates, collisions : CollissionMap) {
    
    let sourceX = Math.floor(sourceCoords.x);
    let sourceY = Math.floor(sourceCoords.y);

    let targetX = Math.floor(targetCoords.x);
    let targetY = Math.floor(targetCoords.y);

    let gapBetweenX = sourceCoords.x - targetX;
    let gapBetweenY = sourceCoords.y - targetY;
    if (gapBetweenX < 0) gapBetweenX = gapBetweenX * -1
    if (gapBetweenY < 0) gapBetweenY = gapBetweenY * -1

    let combined = [];

    let biggestDistance = gapBetweenX > gapBetweenY ? gapBetweenX : gapBetweenY;

    for (let i = 0; i < biggestDistance; i++) {
      let newPositionX = (gapBetweenX / biggestDistance);
      let newPositionY = (gapBetweenY / biggestDistance);

      if (targetX < sourceX) {
  
          if (targetX > sourceX) {
              sourceX = targetX
          }
  
          sourceX = sourceX - newPositionX
      } else {
  
          if (targetX < sourceX) {
              sourceX = targetX
          }
  
          sourceX = sourceX + newPositionX
      }
  
      if (targetY < sourceY) {

          if (targetY > sourceY) {
              sourceY = targetY
          }
  
          sourceY = sourceY - newPositionY
      } else {
          
          if (targetY < sourceY) {
              sourceY = targetY
          }
  
          sourceY = sourceY + newPositionY
      }

      if (collisions && collisions[`${Math.floor(sourceX)},${Math.floor(sourceY)}`]) {
        i = biggestDistance + 1
      } else {
          combined.push({
            x: Math.floor(sourceX),
            y: Math.floor(sourceY)
          })
      }
      
    }

    return combined;
}

function getNextPosition(sourceX: number, sourceY: number, distance : number, angle: number) : coordinates {
    return {
        x : sourceX + distance * Math.cos(angleToRadians(angle)),
        y : sourceY + distance * Math.sin(angleToRadians(angle)),
    }
}

function getAngle(sx: number, sy: number, tx: number, ty: number): number {
    return Math.atan2(ty - sy, tx - sx) * 180 / Math.PI;
}


function angleToRadians(degreeAngle: number) {
    return (Math.PI / 180) * degreeAngle;
}

export {}