export default function updateMirrorPosition(scene) {
    let angle = scene.player.rotation;
    let r = 25;

    scene.mirror.x = scene.player.x + r * Math.cos(angle);
    scene.mirror.y = scene.player.y + r * Math.sin(angle);
    scene.mirror.rotation = angle + (90 * Math.PI / 180);
}