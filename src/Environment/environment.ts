import _ from "lodash";
import { RaycastWorker } from "../Player/Raycast/raycast";
import { generateCollissionMap } from "./generateCollissionMap"

export const environment = { 
    limits: {
        left : 0,
        right : 3000,
        top : 0,
        bottom : 3000,
    },
} as Environment

export function generateEnvironment() {
    environment.collissions = generateCollissionMap(environment);
    environment.corners = {}
    
    _.map(environment.collissions, (collission, coord) => {
        if (collission.isCorner) {
            environment.corners[coord] = collission
        }
    });
    
    RaycastWorker.postMessage({ messageType: 'ENVIRONMENT', payload: environment})
    return;
}
