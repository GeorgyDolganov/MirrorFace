import Phaser from 'phaser';
import logoPNG from "../assets/menuLogo.png"
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

        this.logo = this.add.image(380, 280, "game_logo");
        this.logo.setOrigin(0.5)
        this.logo.setScale(1)

        this.controlsContainer = this.add.container();
        this.controlsContainer.setDepth(100)
        let blackout = this.add.graphics();
        this.controlsContainer.add(blackout)
        blackout.fillStyle(0x000000, 1);
        blackout.fillRect(0, 0, 800, 600);
        blackout.setScrollFactor(0);
        this.controlsContainer.visible = false

        this.creditsContainer = this.add.container();
        this.creditsContainer.setDepth(100)
        let blackoutCredits = this.add.graphics();
        this.creditsContainer.add(blackoutCredits)
        blackoutCredits.fillStyle(0x000000, 1);
        blackoutCredits.fillRect(0, 0, 800, 600);
        blackoutCredits.setScrollFactor(0);
        this.creditsContainer.visible = false

        optionSound = this.sound.add('option', {
            volume: 0.25,
            loop: false
        })

        WebFont.load({
            google: {
                families: ['Press Start 2P']
            },
            active: () => {
                console.log("Webfonts loaded.");
                this.createMenuItem({
                    label: "START",
                    position: { x: 400, y: 500 },
                    onClick: () => {
                        console.log("Starting new game...");
                        this.scene.start("Arena0")
                    }
                });
                this.createMenuItem({
                    label: "CONTROLS",
                    position: { x: 400, y: 525 },
                    onClick: () => {
                        this.controlsContainer.visible = true;
                    }
                });
                this.createMenuItem({
                    label: "CREDITS",
                    position: { x: 400, y: 550 },
                    onClick: () => {
                        this.creditsContainer.visible = true;
                    }
                });

                this.createControls();
                this.createCredits();
            }
        });
    }

    createCredits() {
        let text = this.add.text(400, 150, "CREDITS", { fontFamily: '"Press Start 2P"', align: 'center', fontSize: 40, color: "#fff8e1" });
        this.creditsContainer.add(text)
        text.setScrollFactor(0);
        text.setOrigin(0.5);
        let creditsText = this.add.text(400, 350, [
            "Game Design",
            "George Dolganov", "",
            "Programming",
            "George Dolganov",
            "Ilya Seleznev",
            "Denis Moiseev", "",
            "Art",
            "George Dolganov",
            "Ksenia Belova",
            "UncleWind",
        ], {
            fixedWidth: 400,
            lineSpacing: 10,
            fontFamily: '"Press Start 2P"',
            align: 'center',
            fontSize: 10,
            color: "#c8b89f",
        });
        creditsText.setScrollFactor(0);
        creditsText.setOrigin(0.5);
        this.creditsContainer.add(creditsText)
        let btn = this.createMenuItem({
            label: "Return",
            position: { x: 400, y: 500 },
            onClick: () => {
                console.log("Return to menu");
                this.creditsContainer.visible = false

            }
        });
        this.creditsContainer.add(btn)
    }

    createControls() {
        let text = this.add.text(400, 150, "CONTROLS", { fontFamily: '"Press Start 2P"', align: 'center', fontSize: 40, color: "#fff8e1" });
        this.controlsContainer.add(text)
        text.setScrollFactor(0);
        text.setOrigin(0.5);
        let controlsText = this.add.text(400, 350, [
            "Use the mouse to rotate the player and",
            "reflect lasers by the mirror", "",
            "WASD - move the player around the map", "",
            "G - change item type", "",
            "Space - apply item, or throw a grenade",
            "to the area, where the pointer is", "",
            "Left Click - melee, for example, try", "to break crates or attack enemies", "",
        ], {
            fixedWidth: 400,
            lineSpacing: 10,
            fontFamily: '"Press Start 2P"',
            align: 'left',
            fontSize: 10,
            color: "#c8b89f",
        });
        controlsText.setScrollFactor(0);
        controlsText.setOrigin(0.5);
        this.controlsContainer.add(controlsText)
        let btn = this.createMenuItem({
            label: "Return",
            position: { x: 400, y: 500 },
            onClick: () => {
                console.log("Return to menu");
                this.controlsContainer.visible = false

            }
        });
        this.controlsContainer.add(btn)
    }

    createMenuItem({ label, onClick, position }) {
        let t;
        t = this.add.text(position.x, position.y, label, { fontFamily: '"Press Start 2P"', align: 'center', fontSize: 15, color: "#3b9a52" });
        t.setPosition(t.x - t.width / 2, t.y);
        t.setInteractive({ cursor: 'pointer' });
        t.on("pointerdown", onClick);

        t.on('pointerover', function(pointer) {
            t.setColor("#4fd06e")
            optionSound.stop()
            optionSound.play()
        });
        t.on('pointerout', function(pointer) {
            t.setColor("#3b9a52")
        });
        return t
    }
}