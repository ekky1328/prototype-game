import { SETTINGS } from "../main";

export function toggleSettings() {

    const settingsEl = document.getElementById('settings');
    settingsEl?.classList.toggle('d-none');

    return;
};

let debugInputEl = document.getElementById('debug') as HTMLElement;
let raycastingInputEl = document.getElementById('raycasting') as HTMLElement;

debugInputEl.addEventListener('change', () => {
    // @ts-ignore
    let debugSetting = debugInputEl.value;
    if (debugSetting === 'true') {
        SETTINGS.debug = true
    } else {
        SETTINGS.debug = false
    }
})

raycastingInputEl.addEventListener('change', () => {
    // @ts-ignore
    let raycastSetting = debugInputEl.value;
    SETTINGS.raycast.type = raycastSetting
})