import { environment } from "../Environment/environment";
import { getPlayerInfo } from "../Globals/Players";
import { SETTINGS } from '../main';
import { generateDirectPath } from '../Utilities/generateDirectPath';
import { debugLineOfSight, drawLineOfSight } from './lineOfSight';


export function detectOtherPlayers(targetPlayerId: number) {
    let playerInfo = getPlayerInfo(targetPlayerId);

    if (playerInfo) {
        const allPlayerElements = Array.from(document.querySelectorAll('.player'))
            .filter((p) => Number(p.getAttribute('data-player-id')) !== playerInfo?.id) as HTMLElement[];

        for (let p = 0; p < allPlayerElements.length; p++) {
            const targetPlayerElement = allPlayerElements[p];
            const targerPlayerInfo = getPlayerInfo(Number(targetPlayerElement.getAttribute('data-player-id')));

            if (targerPlayerInfo === undefined)
                return;

            // Create a dedicated line of sight x,y path
            const path = generateDirectPath({ x: playerInfo.current_position.x, y: playerInfo.current_position.y }, { x: targerPlayerInfo.current_position.x, y: targerPlayerInfo.current_position.y }, environment.collissions);

            // Draw the line between the two points
            if (SETTINGS.debug) {
                debugLineOfSight(path, targerPlayerInfo, playerInfo, targetPlayerElement);
            } else {
                drawLineOfSight(path, targerPlayerInfo, playerInfo, targetPlayerElement);
            }

        }

    }

    return;
}
