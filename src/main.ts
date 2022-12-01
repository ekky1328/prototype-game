import './style.css'

import { createPlayer } from './Player/player'
import { getRandomNumber } from './Utilities/getRandomNumber'
import { setActivePlayer } from './Globals/Players';
import { drawFogOfWar } from './Player/Raycast/fogOfWar';
import { drawCollissionOverlay } from './Environment/generateCollissionMap';
import { environment, generateEnvironment } from './Environment/environment';
import { createWall } from './Environment/Wall/wall';

export const app = document.getElementById('app') as HTMLElement;
export const MAP_OFFSET = 1500;
export const SETTINGS = {
  debug : false,
  raycast: {
    type: 'main_thread'
  }
};

let PLAYER_1 = {
  id : getRandomNumber(1001, 9999),
  team : 1,
  name : 'Ekky',
  health: 100,
  armour: 100,
  current_position : {
    x : 25,
    y: 25,
    rotation: 0,
  },
  weapons : [{
    id : 1,
    active: true,
    ammo: 12,
    firing_rate : 500,
    type: 'PISTOL'
  }]
}

let PLAYER_2 = {
  id : getRandomNumber(1001, 9999),
  team : 1,
  name : 'Tonkymac',
  health: 100,
  armour: 100,
  current_position : {
    x : 125,
    y: 125,
    rotation: 0,
  },
  weapons : [{
    id : 1,
    active: true,
    ammo: 12,
    firing_rate : 500,
    type: 'PISTOL'
  }]
}

let PLAYER_3 = {
  id : getRandomNumber(1001, 9999),
  team : 2,
  name : 'Frank',
  health: 100,
  armour: 100,
  current_position : {
    x : 925,
    y: 1025,
    rotation: 0,
  },
  weapons : [{
    id : 1,
    active: true,
    ammo: 12,
    firing_rate : 500,
    type: 'PISTOL'
  }]
}

let WALL_1 = {
  x: 400,
  y: 400,
  width: 300,
  height: 20
}

let WALL_2 = {
  x: 1200,
  y: 1200,
  width: 20,
  height: 300
}

document.addEventListener('DOMContentLoaded' , () => { 
  generateEnvironment();
  drawFogOfWar();
  
  createWall(WALL_1)
  createWall(WALL_2)

  if (SETTINGS.debug) {
    drawCollissionOverlay(environment);
  }

  setActivePlayer(PLAYER_1.id);
  createPlayer(PLAYER_1, true);
  createPlayer(PLAYER_2, false);
  createPlayer(PLAYER_3, false);

})

