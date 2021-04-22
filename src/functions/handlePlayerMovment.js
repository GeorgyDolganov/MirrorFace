export default function handlePlayerMovement(player, cursors) {
    const angle = cursors.up.isDown && cursors.left.isDown ||
        cursors.up.isDown && cursors.right.isDown ||
        cursors.down.isDown && cursors.left.isDown ||
        cursors.down.isDown && cursors.right.isDown

    const BASE_SPEED = player.speed
    const SPEED = angle ? Math.sqrt(BASE_SPEED * BASE_SPEED / 2) : BASE_SPEED

    if (cursors.left.isDown) {
        player.body.setVelocityX(-SPEED);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(SPEED);
    }

    if (cursors.up.isDown) {
        player.body.setVelocityY(-SPEED);
    } else if (cursors.down.isDown) {
        player.body.setVelocityY(SPEED);
    }
}

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