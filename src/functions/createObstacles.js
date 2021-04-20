import Player from "../GameObjects/Player";

//TODO: remove all this
export default function createObstacles(scene, obstacles) {
    let obstacle;

    // Create reflection particles for grenade
    scene.reflectionParticles = []
    for (let i = 0; i < 50; i++) {
        obstacle = scene.add.rectangle(-999, -999, 10, 10)
            .setStrokeStyle(1, 0xff0000);
        obstacles.add(obstacle, true);
        obstacle.canReflect = true;
        scene.reflectionParticles.push(obstacle);
    }


    scene.player = new Player(scene, scene.healthBar);

    window.addEventListener('keypress', e => {
        switch(e.code) {
            case 'Space': {
                scene.player.throw();
                break;
            }
            case 'KeyG': {
                scene.player.changeItem();
                break;
            }
        }
    })

    scene.mirror = scene.physics.add.sprite(0, 0, "mirror");
    scene.mirror.setImmovable();
    scene.mirror.canReflect = true;

    obstacles.add(scene.player, true);
    obstacles.add(scene.mirror, true);
}