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
    return;
}