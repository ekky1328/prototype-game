import { getAngle } from '../Utilities/getAngle';
import { app } from '../main';
import { getDistance } from '../Utilities/getDistance';
import { FOV } from './player';

export function lineOfSight(xypath: coordinates[], targetPlayerInfo: player_info, sourcePlayerInfo: player_info, targetPlayerEl?: HTMLElement) {
    const startingPoint = xypath[0];
    const targetPoint = xypath[xypath.length - 1];
    const angleToTarget = getAngle(startingPoint.x, startingPoint.y, targetPoint.x, targetPoint.y);

    let facingTarget = false;
    let lowerLimitFov = sourcePlayerInfo.current_position.rotation > (angleToTarget + 90) - FOV;
    let higherLimitFov = sourcePlayerInfo.current_position.rotation < (angleToTarget + 90) + FOV;

    const canSeePlayer = targetPoint.x - 5 < targetPlayerInfo.current_position.x // If player is 5px to the right of los
                         && targetPoint.x + 5 > targetPlayerInfo.current_position.x  // If player is 5px to the left of los
                         && targetPoint.y - 5 < targetPlayerInfo.current_position.y // If player is 5px below the los
                         && targetPoint.y + 5 > targetPlayerInfo.current_position.y; // If player is 5px above the los

    if (lowerLimitFov && higherLimitFov && canSeePlayer) {
        facingTarget = true;
    } else {
        facingTarget = false;
    }

    if (facingTarget) {
        targetPlayerEl?.classList.add('visible');
        targetPlayerEl?.classList.remove('same-team-not-visible');
    } else {
        targetPlayerEl?.classList.remove('visible');
    }

    // Always keep team mates visible if you're not facing them...
    if (!facingTarget && sourcePlayerInfo.team === targetPlayerInfo.team) {
        targetPlayerEl?.classList.add('visible');
        targetPlayerEl?.classList.add('same-team-not-visible');
    }
}

export function debugLineOfSight(xypath: coordinates[], targetPlayerInfo: player_info, sourcePlayerInfo: player_info, targetPlayerEl?: HTMLElement) {
    const startingPoint = xypath[0];
    const targetPoint = xypath[xypath.length - 1];
    const angleToTarget = getAngle(startingPoint.x, startingPoint.y, targetPoint.x, targetPoint.y);

    const distance = getDistance(startingPoint.x, startingPoint.y, targetPoint.x, targetPoint.y);

    let facingTarget = false;
    let lowerLimitFov = sourcePlayerInfo.current_position.rotation > (angleToTarget + 90) - FOV;
    let higherLimitFov = sourcePlayerInfo.current_position.rotation < (angleToTarget + 90) + FOV;

    console.log(targetPoint, targetPlayerInfo.current_position)

    if (lowerLimitFov && higherLimitFov) {
        facingTarget = true;
    }

    const existingLosEl = document.getElementById(`los-${targetPlayerInfo.id}-${sourcePlayerInfo.id}`);
    if (!existingLosEl) {

        const newLosEntity = window.document.createElement('div');
        const newLosIdentifier = sourcePlayerInfo.id;

        newLosEntity.id = `los-${targetPlayerInfo.id}-${sourcePlayerInfo.id}`;
        newLosEntity.classList.add(`los`);
        newLosEntity.setAttribute('data-los-id', `${newLosIdentifier}`);

        if (facingTarget) {
            targetPlayerEl?.classList.add('visible');
            newLosEntity.style.backgroundColor = 'green';
        } else {
            targetPlayerEl?.classList.remove('visible');
            newLosEntity.style.backgroundColor = 'red';
        }

        window.requestAnimationFrame(() => { 
            newLosEntity.style.width = `${distance}px`;
            newLosEntity.style.transform = `translate3d(${startingPoint.x + 22}px, ${startingPoint.y + 22}px, 0) rotate(${angleToTarget}deg)`;
        })

        app.appendChild(newLosEntity);
    }


    // If the elements have been previously drawn, then update them...
    else {
        existingLosEl.style.width = `${distance}px`;
        
        if (facingTarget) {
            targetPlayerEl?.classList.add('visible');
            existingLosEl.style.backgroundColor = 'green';
        } 
        
        else {

            if (sourcePlayerInfo.team === targetPlayerInfo.team) {
                targetPlayerEl?.classList.add('visible');
            } 
            
            else {
                targetPlayerEl?.classList.remove('visible');
                existingLosEl.style.backgroundColor = 'red';
            }

        }


        window.requestAnimationFrame(() => {
            existingLosEl.style.transform = `translate3d(${startingPoint.x + 22}px, ${startingPoint.y + 22}px, 0) rotate(${angleToTarget}deg)`;
        })
    }
}
