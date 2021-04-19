import RaycasterEnemy from "../GameObjects/Enemies/RaycasterEnemy";

export default class EnemiesManager {
    _enemies = [];

    spawnCooldown = 2000;
    currentCooldown = 0;

    constructor(scene, raycaster) {
        this._scene = scene;
        this._raycaster = raycaster;
    }

    update(time, delta) {
        this.updateEnemies();

        this.currentCooldown += delta;
        if( this.currentCooldown > this.spawnCooldown ) {
            this.spawnRandomAt(200, 200);
            this.currentCooldown = 0;
        }
    }

    updateEnemies(time, delta) {
        let markForRemove = [];
        this._enemies.forEach((e, index) => {
            if( e.isAlive() ) {
                e.update(this._scene.player);
            } else {
                markForRemove.push(index);
                e.die();
            }
        });
        markForRemove.forEach(i => {
            this._enemies.splice(i, 1);
        })
    }

    spawnRandomAt(position) {
        let type = this.getRandomEnemyType();
        let enemy = new type(this._scene, position.x, position.y);
        this._raycaster.mapGameObjects(enemy, true);
        this._enemies.push(enemy);
    }

    getRandomEnemyType() {
        return RaycasterEnemy;
    }
}