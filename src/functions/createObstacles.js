

const objects = ['crate', 'crate2', 'crateBig']

//TODO: remove all this
/**
 * @param {Phaser.Scene} scene
 */
export default function createObstacles(scene, obstacles) {
    let obstacle;

    // Create reflection particles for grenade
    scene.reflectionParticles = []
    for (let i = 0; i < 50; i++) {
        obstacle = scene.physics.add.sprite(-999, -999, "shard");
        obstacles.add(obstacle, true);
        obstacle.canReflect = true;
        scene.reflectionParticles.push(obstacle);
    }
}