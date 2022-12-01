import './collissionmap.css'

import { app } from "../main";

export function generateCollissionMap(environment : Environment) : CollissionMap {

    let collissionMap = {} as CollissionMap

    const corner_collission = {
        type: 'WALL',
        entity: true,
        ray: true,
        projectile: true,
        isCorner: true,
        isVisible: false
    }

    collissionMap[`${environment.limits.left},${environment.limits.top}`] = corner_collission;
    collissionMap[`${environment.limits.right},${environment.limits.top}`] = corner_collission;
    collissionMap[`${environment.limits.right},${environment.limits.bottom}`] = corner_collission;
    collissionMap[`${environment.limits.left},${environment.limits.bottom}`] = corner_collission;

    return { ...collissionMap, ...environment.collissions };
}

export function drawCollissionOverlay(environment : Environment) {

    function getNode(n: string, v: any) {
        let s = document.createElementNS("http://www.w3.org/2000/svg", n) as SVGAElement;
        for (var p in v) {
            s.setAttributeNS(null, p.replace(/[A-Z]/g, function(m) { return "-" + m.toLowerCase(); }), v[p]);
        }
        return s
    }
      
    var svg = getNode("svg", { id: 'collission-overlay', width: environment.limits.right, height: environment.limits.bottom });
    app.appendChild(svg);

    const coordinates = Object.keys(environment.collissions);
    for (let i = 0; i < coordinates.length; i++) {
        let [ x, y ] = coordinates[i].split(',');
        // let collission_setting = environment.collissions[coordinates[i]];
        
        const svgConfig = { id: `collission-${x}-${y}`, x, y, width: 1, height: 1, fill:'#ff00ff' }
        var r = getNode('rect', svgConfig);
        svg.appendChild(r);
    }

}
