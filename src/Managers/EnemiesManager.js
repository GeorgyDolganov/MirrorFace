import RaycasterEnemy from "../GameObjects/Enemies/RaycasterEnemy";
import DoubleRaycasterEnemyFirst from "../GameObjects/Enemies/DoubleRaycasterEnemyFirst";
import DoubleRaycasterEnemySecond from "../GameObjects/Enemies/DoubleRaycasterEnemySecond";
import EnemyFactory from "./EnemiesPool";

export default class EnemiesManager {
    _enemies = [];
    _enemiesFactory;

    spawnCooldown = 10000;
    currentCooldown = 0;

    constructor(scene, raycaster) {
        this._scene = scene;
        this._enemiesFactory = new EnemyFactory(scene, raycaster);
    }

    update(time, delta) {
        this.updateEnemies();

        this.currentCooldown += delta;
        if( this.currentCooldown > this.spawnCooldown ) {
            this.spawnRandomAt({x: 100, y: 100});
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
                //e.die();
                this._enemiesFactory.kill(e);
            }
        });
        markForRemove.forEach(i => {
            this._enemies.splice(i, 1);
        })
    }

    spawnRandomAt(position) {
        this.spawnAt(position, this.getRandomEnemyType());
    }

    spawnAt(position, type) {
        let enemy = this._enemiesFactory.create(type, position);
        this._enemies.push(enemy);
    }

    getRandomEnemyType() {
        let map = [ RaycasterEnemy, DoubleRaycasterEnemyFirst, DoubleRaycasterEnemySecond ];

        let index = Math.floor(Math.random() * (map.length));
        return map[index];
    }
}