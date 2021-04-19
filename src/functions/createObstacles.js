import Enemy from "../GameObjects/Enemy";
import Player from "../GameObjects/Player";
import RaycasterEnemy from "../GameObjects/Enemies/RaycasterEnemy";
import DoubleRaycasterEnemyFirst from "../GameObjects/Enemies/DoubleRaycasterEnemyFirst";
import DoubleRaycasterEnemySecond from "../GameObjects/Enemies/DoubleRaycasterEnemySecond";

export default function createObstacles(scene, obstacles, bullets) {
    //create rectangle obstacle
    let obstacle = scene.add.rectangle(100, 100, 75, 75)
        .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle, true);

    //create line obstacle
    obstacle = scene.add.line(400, 100, 0, 0, 200, 50)
        .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle);

    //create circle obstacle
    obstacle = scene.add.circle(650, 100, 50)
        .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle);

    //create polygon obstacle
    obstacle = scene.add.polygon(650, 500, [0, 0, 50, 50, 100, 0, 100, 75, 50, 100, 0, 50])
        .setStrokeStyle(1, 0xff0000);
    obstacles.add(obstacle);

    //create overlapping obstacles
    for (let i = 0; i < 5; i++) {
        obstacle = scene.add.rectangle(350 + 30 * i, 550 - 30 * i, 50, 50)
            .setStrokeStyle(1, 0xff0000);
        obstacles.add(obstacle, true);
    }

    //create image obstacle
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

    scene.enemy = new RaycasterEnemy(scene, 100, 200);
    obstacles.add(scene.enemy, true);

    scene.enemyDoubleFirst = new DoubleRaycasterEnemyFirst(scene, 400, 600);
    obstacles.add(scene.enemyDoubleFirst, true);

    scene.enemyDoubleSecond = new DoubleRaycasterEnemySecond(scene, 200, 1000);
    obstacles.add(scene.enemyDoubleSecond, true);

    obstacles.add(scene.player, true);
    obstacles.add(scene.mirror, true);
}