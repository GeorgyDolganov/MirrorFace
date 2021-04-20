
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

    }

    create(type, position) {
        let enemy = new type(this._scene, position.x, position.y);
        this._raycaster.mapGameObjects(enemy, true);
        this._physicsGroup.add(enemy);
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