import './player.css'
import { ACTIVE_PLAYER, addPlayer } from "../Globals/Players";
import { app } from '../main';
import { addPlayerInteractivity } from './interactivity';

export const SPEED = 3;
export const HELD_DIRECTIONS = [] as string[]
export const PLAYER_HIT_BOX = 44;
export const FOV = 55;

export const directions = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
};

export const keys = {
    w: directions.up,
    W: directions.up,
    a: directions.left,
    A: directions.left,
    d: directions.right,
    D: directions.right,
    s: directions.down,
    S: directions.down,
};

export function createPlayer( playerInfo : player_info, controllable: boolean = false ) {

    const newPlayerEntity = window.document.createElement('div');
    const newPlayerIdentifier = playerInfo.id;

    // Set an ID for the new player on their element.
    // Set the team for the new player.
    newPlayerEntity.id = `player-${newPlayerIdentifier}`;
    newPlayerEntity.classList.add(`player`);
    if (playerInfo.id === ACTIVE_PLAYER) {
        newPlayerEntity.classList.add(`visible`);
    }
    newPlayerEntity.classList.add(`team-${playerInfo.team}`);
    newPlayerEntity.setAttribute('data-player-team', `${playerInfo.team}`);
    newPlayerEntity.setAttribute('data-player-id', `${newPlayerIdentifier}`);
    newPlayerEntity.style.transform = `translate3d(${playerInfo.current_position.x}px, ${playerInfo.current_position.y}px, 0) rotate(${playerInfo.current_position.rotation}deg)`;
    
    // Write player to screen
    app.appendChild(newPlayerEntity);
    addPlayer(playerInfo);


    // Camera & Current Position Loop
    let renderedPlayerElement = document.getElementById(newPlayerEntity.id) as HTMLElement;

    // Create Player Interactivity
    if (controllable) {
        addPlayerInteractivity(renderedPlayerElement, newPlayerIdentifier);
    }

    return;
};
