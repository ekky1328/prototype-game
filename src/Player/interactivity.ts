import { ACTIVE_PLAYER, getPlayerInfo } from "../Globals/Players";
import { getAngle } from '../Utilities/getAngle';
import { MAP_OFFSET, SETTINGS } from '../main';
import { detectOtherPlayers } from './detection';
import { environment } from "../Environment/environment";
import { keys, HELD_DIRECTIONS, directions, SPEED, PLAYER_HIT_BOX, FOV } from './player';
import { generateRayCast, generate2dRaycast, RaycastTypes } from "./Raycast/raycast";

export function addPlayerInteractivity(renderedPlayerElement: HTMLElement, targetPlayerId: number) {
    let playerInfo = getPlayerInfo(targetPlayerId) as player_info;

    // Player bound event listeners
    window.addEventListener('keydown', (e) => {
        // @ts-ignore
        let dir = keys[e.key];
        if (dir && HELD_DIRECTIONS.indexOf(dir) === -1) {
            // @ts-ignore
            HELD_DIRECTIONS.unshift(directions[dir]);
        }

        renderedPlayerElement.setAttribute('moving', 'true');
    });

    window.addEventListener('mousemove', (e) => {
        if (playerInfo) {
            let currentMouseX = e.pageX;
            let currentMouseY = e.pageY;

            let pointerBox = renderedPlayerElement.getBoundingClientRect();
            let centerPoint = window.getComputedStyle(renderedPlayerElement).transformOrigin;
            let centers = centerPoint.split(" ");
            let centerY = pointerBox.top + parseInt(centers[1]) + scrollY;
            let centerX = pointerBox.left + parseInt(centers[0]) + scrollX;

            playerInfo.current_position.rotation = getAngle(centerX, centerY, currentMouseX, currentMouseY) + 87.5; // 90deg to the angle so the top 
        }
    });

    window.addEventListener('keyup', (e) => {
        // @ts-ignore
        var dir = keys[e.key];
        var index = HELD_DIRECTIONS.indexOf(dir);
        if (index > -1) {
            HELD_DIRECTIONS.splice(index, 1);
        }

        renderedPlayerElement.setAttribute('moving', 'false');
    });


    setInterval(() => {
        if (playerInfo && ACTIVE_PLAYER === playerInfo.id && window.visualViewport) {
            // generateRayCast(playerInfo, { type: RaycastTypes.CORNERS })
        }
    })

    setInterval(async () => {

        if (playerInfo && ACTIVE_PLAYER === playerInfo.id && window.visualViewport) {

            movement(playerInfo);

            let newX = playerInfo.current_position.x
            let newY = playerInfo.current_position.y
            let newRotation = playerInfo.current_position.rotation
            let cameraX = (playerInfo.current_position.x + MAP_OFFSET) - window.visualViewport.width / 2;
            let cameraY = (playerInfo.current_position.y + MAP_OFFSET) - window.visualViewport.height / 2;
            window.scrollTo(cameraX, cameraY);

            detectOtherPlayers(playerInfo.id);

            if (SETTINGS.raycast) {
                if (SETTINGS.raycast.type === 'web_worker') {
                    generate2dRaycast({ SETTINGS, FOV, PLAYER_HIT_BOX, SPEED, player_info: playerInfo, raycast_config : { type: RaycastTypes.CORNERS } });
                } else if (SETTINGS.raycast.type === 'main_thread') {
                    generateRayCast(playerInfo, { type: RaycastTypes.CORNERS })
                }
            }

            window.requestAnimationFrame(() => {
                renderedPlayerElement.style.transform = `translate3d(${newX}px, ${newY}px, 0) rotate(${newRotation}deg)`;
            });

        }

    });

}

function movement(playerInfo: player_info) {
    const held_direction = HELD_DIRECTIONS[0];
    if (held_direction) {
        if (held_direction === directions.right) {
            playerInfo.current_position.x += SPEED;
        }
        if (held_direction === directions.left) {
            playerInfo.current_position.x -= SPEED;
        }
        if (held_direction === directions.down) {
            playerInfo.current_position.y += SPEED;
        }
        if (held_direction === directions.up) {
            playerInfo.current_position.y -= SPEED;
        }
    }

    if (playerInfo.current_position.x < environment.limits.left) {
        playerInfo.current_position.x = environment.limits.left;
    }

    if (playerInfo.current_position.x > environment.limits.right - PLAYER_HIT_BOX) {
        playerInfo.current_position.x = environment.limits.right - PLAYER_HIT_BOX;
    }

    if (playerInfo.current_position.y < environment.limits.top) {
        playerInfo.current_position.y = environment.limits.top;
    }

    if (playerInfo.current_position.y > environment.limits.bottom - PLAYER_HIT_BOX) {
        playerInfo.current_position.y = environment.limits.bottom - PLAYER_HIT_BOX;
    }

    return;
}

