

export default function updateMirrorPosition(scene) {
    let angle = scene.player.rotation;

    scene.mirror.x = scene.player.x + scene.mirror.radius * Math.cos(angle);
    scene.mirror.y = scene.player.y + scene.mirror.radius * Math.sin(angle);
    scene.mirror.rotation = angle + (90 * Math.PI / 180);
}