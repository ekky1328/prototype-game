let PLAYERS = [] as player_info[];
export let ACTIVE_PLAYER = null as null | number

export function addPlayer(player_info : player_info) {
    let playerJoined = PLAYERS.find((p) => p.id === player_info.id);
    if (playerJoined === undefined) {
        PLAYERS.push(player_info)
    }

    return;
}

export function getPlayerInfo(playerId : number) {
    return PLAYERS.find((p) => p.id === playerId);
}

export function setActivePlayer(playerId : number) {
    ACTIVE_PLAYER = playerId
}