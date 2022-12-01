import './wall.css'

import * as _ from 'lodash';

import { app } from "../../main";
import { getElementCoordinates } from "../../Utilities/getElementCoordinates";
import { getRandomNumber } from "../../Utilities/getRandomNumber";
import { environment } from '../environment';
import { RaycastWorker } from '../../Player/Raycast/raycast';

export function createWall(wallInfo : wall_info) {

    const newWallEntity = window.document.createElement('div');
    const newWallIdentifier = getRandomNumber(1000,9999);

    // Set an ID for the new wall on their element.
    // Set the team for the new wall.
    newWallEntity.id = `wall-${newWallIdentifier}`;
    newWallEntity.classList.add(`wall`);
    newWallEntity.setAttribute('data-wall-id', `${newWallIdentifier}`);
    newWallEntity.style.width = `${wallInfo.width}px`;
    newWallEntity.style.height = `${wallInfo.height}px`;
    newWallEntity.style.transform = `translate3d(${wallInfo.x}px, ${wallInfo.y}px, 0)`;
    
    // Write wall to screen
    app.appendChild(newWallEntity);
    addWallToCollissions(newWallEntity);

    return;
};

export function addWallToCollissions(element : HTMLElement) {
    const newCollissions =  _.cloneDeep(environment.collissions)

    const coords = getElementCoordinates(element);

    const collissionsToAdd = {} as CollissionMap;
    const corner_collission = {
        type: 'WALL',
        entity: true,
        ray: true,
        projectile: true,
        isCorner: true,
        isVisible: false
    }

    const face_collission = {
        type: 'WALL',
        entity: true,
        ray: true,
        projectile: true,
        isCorner: false,
        isVisible: false
    }

    collissionsToAdd[`${Math.floor(coords.left)},${Math.floor(coords.top)}`] = corner_collission;
    collissionsToAdd[`${Math.floor(coords.right)},${Math.floor(coords.bottom)}`] = corner_collission;
    for (let i = coords.left + 1; i < coords.right; i++) {
        let x = i;
        collissionsToAdd[`${Math.floor(x)},${Math.floor(coords.top)}`] = face_collission;
        collissionsToAdd[`${Math.floor(x)},${Math.floor(coords.bottom)}`] = face_collission;
    }
    
    collissionsToAdd[`${Math.floor(coords.right)},${Math.floor(coords.top)}`] = corner_collission;
    collissionsToAdd[`${Math.floor(coords.left)},${Math.floor(coords.bottom)}`] = corner_collission;
    for (let i = coords.top + 1; i < coords.bottom; i++) {
        let y = i;
        collissionsToAdd[`${Math.floor(coords.right)},${Math.floor(y)}`] = face_collission;
        collissionsToAdd[`${Math.floor(coords.left)},${Math.floor(y)}`] = face_collission;
    }
    
    environment.collissions = {...newCollissions, ...collissionsToAdd};
    environment.corners = {};

    _.map(environment.collissions, (collission, coord) => {
        if (collission.isCorner) {
            environment.corners[coord] = collission
        }
    });

    RaycastWorker.postMessage({ messageType: 'ENVIRONMENT', payload: environment})

    return;
}