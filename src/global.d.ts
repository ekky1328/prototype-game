interface GameSettings {
  debug : boolean
}

interface player_info {
  id: number;
  name: string;
  current_position: {
    x: number;
    y: number;
    rotation: number;
  };
  health: number;
  armour: number;
  team: number;
  weapons: {
    id: number;
    active: boolean;
    type: string;
    ammo: number;
    firing_rate: number;
  }[];
}

interface wall_info {
  x: number;
  y: number;
  width: number;
  height: number;
}

type coordinates = {
  x: number;
  y: number;
}

type elementCoordinates = {
  x: number;
  y: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type Environment = {
  limits: {
    left : number;
    right : number;
    top : number;
    bottom : number;
  },
  collissions : CollissionMap
}

interface CollissionMap {
  [key: string]: Collission;
}

type Collission = {
  type : string;
  entity: boolean;
  ray: boolean;
  projectile: boolean;
  isCorner: boolean;
  isVisible: boolean;
  angleFromPlayer?: number;
}

type raycast_config = {
  number_of_rays?: number;
  type: RaycastTypes;
};

enum RaycastTypes {
  SPRAY = 'SPRAY',
  CORNERS = 'CORNERS'
}

type RaycastWorkerData = {
  SETTINGS: GameSettings;
  FOV: number;
  PLAYER_HIT_BOX: number;
  SPEED : number;
  player_info: player_info;
  raycast_config: raycast_config;
  environment: Environment;
}
