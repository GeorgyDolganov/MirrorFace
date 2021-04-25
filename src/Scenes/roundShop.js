import Phaser, {
    Scene
} from 'phaser';

import shopItems from "../Configs/items.json"

import coinAtlasPNG from "../assets/SpriteSheets/coin.png"
import bgAtlasPNG from "../assets/SpriteSheets/shopbg.png"
import bgAtlasJSON from "../assets/SpriteSheets/shopbg.json"

import shopCardPNG from "../assets/shopCard.png"
import mirrorCirclePNG from "../assets/mirrorcircle.png"
import infoPNG from "../assets/info.png"

import shopBGWAV from "../assets/audio/shopBG.wav"
import menuSoundWAV from "../assets/audio/coin.wav"

let optionSound

export default class RoundShop extends Scene {
    coins = '0'
    constructor() {
        super("roundShop")
    }

    wake() {}

    init(data) {
        console.log(data)
        if (typeof data === 'string') {
            this.coins = data
        }
    }

    preload() {
        this.load.atlas('bg', bgAtlasPNG, bgAtlasJSON);
        this.load.spritesheet('coin', coinAtlasPNG, {
            frameWidth: 16,
            frameHeight: 16
        })

        this.load.image('shopCard', shopCardPNG)
        this.load.image('mirrorCircle', mirrorCirclePNG)
        this.load.image('info', infoPNG)

        this.load.audio('shopBG', shopBGWAV)
        this.load.audio('option', menuSoundWAV)

        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {

        this.anims.create({
            key: 'bgAnim',
            frames: this.anims.generateFrameNames('bg', {
                prefix: 'bg_',
                end: 30,
            }),
            repeat: -1
        });
        this.bg = this.add.sprite(0, 0, 'bg')
        this.bg.setScale(8, 6)
        this.bg.play('bgAnim')
        optionSound = this.sound.add('option', {
            volume: 0.25,
            loop: false
        })

        this.bgMusic = this.sound.add('shopBG', {
            loop: true,
            volume: 0.25
        });

        this.bgMusic.play();

        this.wallet = this.add.container()
        this.wallet.bg = this.add.image(752, 50, 'info')
        this.wallet.bg.setScale(1.5)
        this.wallet.amount = this.add.text(725, 40, this.coins, {
            fontFamily: '"Press Start 2P"',
            align: 'center',
            fontSize: 32,
            color: "#fff8e1"
        })
        this.wallet.amount.setOrigin(0)
        this.wallet.amount.setScale(1.5)
        this.wallet.amount.visible = false

        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNames('coin'),
            frameRate: 16,
            repeat: -1,
            yoyo: true
        })
        this.wallet.coin = this.add.sprite(769, 48, 'coin').setScale(1.5);

        this.wallet.coin.anims.load('spin');
        this.wallet.coin.play('spin')

        let itemsKeys = Object.keys(shopItems)
        this.items = []
        for (let i = 0; i < 4; i++) {
            let randomIndex = Math.floor(Math.random() * itemsKeys.length)
            let itemKey = itemsKeys[randomIndex]
            itemsKeys.splice(randomIndex, 1)
            let itemData = shopItems[itemKey]
            console.log(itemData)
            
            this.items[i] = this.add.container()
            this.items[i].active = true
            this.items[i].x = 50
            this.items[i].bg = this.add.image(50 + i * 150, 160, 'shopCard')
            this.items[i].add(this.items[i].bg)
            this.items[i].bg.setOrigin(0)
            this.items[i].bg.setScale(2)
            this.items[i].bg.setInteractive({
                cursor: 'pointer'
            });

            this.items[i].image = this.add.image(115 + i * 150, 214, itemKey)
            this.items[i].add(this.items[i].image)
            this.items[i].image.setOrigin(0.5, 0.5)

            this.items[i].title = this.add.text(170 + i * 150, 282, itemData.name, {
                fontFamily: '"Press Start 2P"',
                align: 'center',
                fontSize: 15,
                color: "#fff8e1"
            })
            this.items[i].add(this.items[i].title)
            this.items[i].title.setOrigin(0, 0.5)
            this.items[i].title.setScale(0.9, 0.9)
            this.items[i].title.x = 62 + i * 150
            this.items[i].title.visible = false

            let content = [
                "Mirror in circle shape.",
                "Overheats faster, but",
                "protects from all angles"
            ];
            this.items[i].description = this.add.text(60 + i * 150, 310, itemData.description, {
                fontFamily: '"Press Start 2P"',
                align: 'left',
                fontSize: 15,
                color: "#fff8e1"
            })
            this.items[i].add(this.items[i].description)
            this.items[i].description.setOrigin(0, 0)
            this.items[i].description.visible = false

            this.items[i].btnBuy = this.add.text(60 + i * 150, 370, 'PRESS LMB TO BUY', {
                fontFamily: '"Press Start 2P"',
                align: 'left',
                fontSize: 15,
                color: "#fff8e1"
            })
            this.items[i].add(this.items[i].btnBuy)
            this.items[i].btnBuy.setOrigin(0, 0)
            this.items[i].btnBuy.visible = false

            this.items[i].price = this.add.text(160 + i * 150, 390, itemData.price + ' coins', {
                fontFamily: '"Press Start 2P"',
                align: 'left',
                fontSize: 15,
                color: "#fff8e1"
            })
            this.items[i].add(this.items[i].price)
            this.items[i].price.setOrigin(0.5, 0)
            this.items[i].price.visible = false

            this.items[i].bg.on("pointerup", ()=>{
                if (!this.items[i].active || this.wallet.amount.text < itemData.price) return
                console.log('buy')
                this.wallet.amount.text = '' + (this.wallet.amount.text - itemData.price)
                this.items[i].bg.setTint(0x000000)
                this.items[i].image.setTint(0x000000)
                this.items[i].title.setTint(0x000000)
                this.items[i].description.setTint(0x000000)
                this.items[i].btnBuy.setTint(0x000000)
                this.items[i].price.setTint(0x000000)
                this.items[i].active = false
                this.tweens.add({
                    targets: [this.items[i]],
                    y: 0,
                    duration: 250,
                    ease: 'Power2'
                })
            });

            this.items[i].bg.on('pointerover', (ev) => {
                if (!this.items[i].active) return
                this.tweens.add({
                    targets: [this.items[i]],
                    y: -20,
                    duration: 250,
                    ease: 'Power2'
                })
            })
            this.items[i].bg.on('pointerout', (ev) => {
                if (!this.items[i].active) return
                console.log(this.items[i])
                this.tweens.add({
                    targets: [this.items[i]],
                    y: 0,
                    duration: 250,
                    ease: 'Power2'
                })
            })
        }

        WebFont.load({
            google: {
                families: ['Press Start 2P']
            },
            active: () => {
                console.log("Webfonts loaded.");
                this.createMenuItem({
                    label: "CONTINUE",
                    position: {
                        x: 700,
                        y: 550
                    },
                    onClick: () => {
                        console.log("Back to arena...");
                        this.bgMusic.stop()
                        this.scene.run("Arena0", { coins: this.wallet.amount.text})
                        this.scene.stop()
                    }
                });
                this.items.forEach(el => {
                    el.title.setFont('"Press Start 2P"')
                    el.title.visible = true
                    el.description.setFont('"Press Start 2P"')
                    el.description.visible = true
                    el.price.setFont('"Press Start 2P"')
                    el.price.visible = true
                    el.btnBuy.setFont('"Press Start 2P"')
                    el.btnBuy.visible = true
                })
                this.wallet.amount.setFont('"Press Start 2P"')
                this.wallet.amount.visible = true

            }
        });
    }

    update(time, delta) {}

    createMenuItem({
        label,
        onClick,
        position
    }) {
        let t;
        t = this.add.text(position.x, position.y, label, {
            fontFamily: '"Press Start 2P"',
            align: 'center',
            fontSize: 15,
            color: "#fff8e1"
        });
        t.setPosition(t.x - t.width / 2, t.y);
        t.setInteractive({
            cursor: 'pointer'
        });
        t.on("pointerdown", onClick);

        t.on('pointerover', function (pointer) {
            t.setColor("#c8b89f")
            optionSound.stop()
            optionSound.play()
        });
        t.on('pointerout', function (pointer) {
            t.setColor("#fff8e1")
        });
    }
}