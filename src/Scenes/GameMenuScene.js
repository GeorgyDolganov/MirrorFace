import Phaser from 'phaser';
import logoPNG from "../assets/game_logo.png"
import menuSound from "../assets/audio/coin.wav"

let optionSound

export default class GameMenuScene extends Phaser.Scene {

    constructor() {
        super("GameMenuScene");
    }

    preload() {
        this.load.image('game_logo', logoPNG);
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        this.load.audio('option', menuSound)
        
    }

    create() {
        console.log("Game Menu loaded.");

        this.add.image(400, 180, "game_logo");
        optionSound = this.sound.add('option', {
            volume: 0.25,
            loop: false
        })

        WebFont.load({
            google: {
                families: [ 'Press Start 2P' ]
            },
            active: () => {
                console.log("Webfonts loaded.");
                this.createMenuItem({
                    label: "START",
                    position: {x: 400, y: 400},
                    onClick: () => {
                        console.log("Starting new game...");
                        this.scene.start("Arena0")
                    }
                });
                this.createMenuItem({
                    label: "MIRROR SHOP",
                    position: {x: 400, y: 425},
                    onClick: () => {
                        alert("In development");
                    }
                });
                this.createMenuItem({
                    label: "SETTINGS",
                    position: {x: 400, y: 450},
                    onClick: () => {
                        alert("In development");
                    }
                });

            }
        });
    }

    createMenuItem({label, onClick, position}) {
        let t;
        t = this.add.text(position.x, position.y, label, { fontFamily: '"Press Start 2P"', align: 'center', fontSize: 15, color: "#3b9a52" });
        t.setPosition(t.x - t.width/2, t.y);
        t.setInteractive({ cursor: 'pointer' });
        t.on("pointerdown", onClick);

        t.on('pointerover', function (pointer) {
            t.setColor("#4fd06e")
            optionSound.stop()
            optionSound.play()
        });
        t.on('pointerout', function (pointer) {
            t.setColor("#3b9a52")
        });
    }
}