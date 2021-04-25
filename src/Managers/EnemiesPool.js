
export default class EnemiesPool {
    _scene;
    _raycaster;

    _physicsGroup;
    _objectGroup;

    constructor(scene,raycaster) {
        this._scene = scene;
        this._physicsGroup = scene.physics.add.group({
            collideWorldBounds: true
        });
        this._objectGroup = scene.add.group();
        this._raycaster = raycaster;


        this._scene.physics.add.collider(this._physicsGroup, this._physicsGroup);
        this._scene.physics.add.collider(this._physicsGroup, [scene.staticObstacles, scene.wallLayer, scene.objLayer, scene.reflectLayer]);
    }

    create(type, position) {
        let enemy = new type(this._scene, position.x, position.y).setPipeline('Light2D');
        this._raycaster.mapGameObjects(enemy, true);
        if( !enemy.nonCollidable ) {
            this._physicsGroup.add(enemy);
        }

        this._objectGroup.add(enemy);

        return enemy;
    }

    kill(object) {
        this._objectGroup.killAndHide(object);
        this._physicsGroup.killAndHide(object);
        this._raycaster.disableMaps(object);
        if( object.die ) object.die();
    }
}