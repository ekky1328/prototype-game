export function getDistance(sx: number, sy: number, tx: number, ty: number){
    let y = tx - sx;
    let x = ty - sy;
    
    return Math.sqrt(x * x + y * y);
}