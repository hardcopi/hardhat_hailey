// =============================================================================
// Sprites
// =============================================================================

//
// Hero
//

function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');

    // anchor
    this.anchor.set(0.5, 0.5);
    // physics properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    // animations
    this.animations.add('stop', [0]);
    this.animations.add('run', [1, 2, 3], 8, true); // 8fps looped
    this.animations.add('jump', [1], 8, true);
    this.animations.add('fall', [2]);
    this.animations.add('die', [1, 2, 3], 8); // 12fps no loop
    // starting animation
    this.animations.play('stop');
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    // guard
    if (this.isFrozen) { return; }

    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;

    // update image flipping & animations
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 400;
    let canJump = this.body.touching.down && this.alive && !this.isFrozen;

    if (canJump || this.isBoosting) {
        this.body.velocity.y = -JUMP_SPEED;
        this.isBoosting = true;
    }

    return canJump;
};

Hero.prototype.stopJumpBoost = function () {
    this.isBoosting = false;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};

Hero.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// returns the animation name that should be playing depending on
// current circumstances
Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // dying
    if (!this.alive) {
        name = 'die';
    }
    // frozen & not dying
    else if (this.isFrozen) {
        name = 'stop';
    }
    // jumping
    else if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

//
// Spider (enemy)
//

function Spider(game, x, y) {
    var enemyChoice = Math.floor(Math.random() * 2);
    if (enemyChoice == 0) {
        Phaser.Sprite.call(this, game, x, y, 'spider');
    }
    if (enemyChoice == 1) {
        Phaser.Sprite.call(this, game, x, y, 'dozer');
    }


    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
        this.scale.x = -1;
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
        this.scale.x = 1;
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// =============================================================================
// Loading state
// =============================================================================

LoadingState = {};

LoadingState.init = function () {

    this.game.renderer.renderSession.roundPixels = true;
    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();
    this.game.state.start('preloader');

};

LoadingState.preload = function () {
    var d = Math.round(new Date().getTime()/1000);
    console.log(d);
    this.game.load.bitmapFont('carrier_command', 'fonts/bitmapFonts/carrier_command_black.png?' + d, 'fonts/bitmapFonts/carrier_command.xml');
    this.game.load.image('knightHawks', 'fonts/retroFonts/KNIGHT3.png');
    this.game.load.bitmapFont('desyrel', 'fonts/bitmapFonts/desyrel.png', 'fonts/bitmapFonts/desyrel.xml');

    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');

    this.game.load.image('font:numbers', 'images/numbers.png?' + d);
    this.load.spritesheet('gamepad', 'images/gamepad_spritesheet.png?' + d, 100, 100);
    this.game.load.image('icon:coin', 'images/coin_icon.png?' + d);
    this.game.load.image('background', 'images/factory.png?' + d);
    this.game.load.image('startmenu', 'images/startmenu.png?' + d);
    this.game.load.image('invisible-wall', 'images/invisible_wall.png?' + d);
    this.game.load.image('ground', 'images/ground.png?' + d);
    this.game.load.image('grass:8x1', 'images/grass_8x1.png?' + d);
    this.game.load.image('grass:6x1', 'images/grass_6x1.png?' + d);
    this.game.load.image('grass:4x1', 'images/grass_4x1.png?' + d);
    this.game.load.image('grass:2x1', 'images/grass_2x1.png?' + d);
    this.game.load.image('grass:1x1', 'images/grass_1x1.png?' + d);
    this.game.load.image('key', 'images/key.png?' + d);
    this.game.load.image('boxes', 'images/boxes.png?' + d);
    this.game.load.image('cave-top', 'images/cave-top.png?' + d);
    this.game.load.image('cave-wall', 'images/cave-wall.png?' + d);
    this.game.load.image('cave-floor', 'images/cave-floor.png?' + d);
    this.game.load.image('invisible-wall', 'images/invisible_wall.png?' + d);

    this.game.load.image('txt-watergame', 'images/text-art/watergame.png?' + d);
    this.game.load.image('txtintro0', 'images/text-art/level00.png?' + d);
    this.game.load.image('txtintro1', 'images/text-art/level01.png?' + d);
    this.game.load.image('txtintro2', 'images/text-art/level02.png?' + d);

    this.game.load.image('textbox', 'images/textbox.png?' + d);

    this.game.load.spritesheet('decoration', 'images/decor.png?' + d, 42, 42);
    this.game.load.spritesheet('hero', 'images/hailey.png?' + d, 29, 42);
    this.game.load.spritesheet('hero_stopped', 'images/hero_stopped.png?' + d, 36, 42);
    this.game.load.spritesheet('coin', 'images/coin_animated.png?' + d, 22, 22);
    this.game.load.spritesheet('spider', 'images/spider.png?' + d, 42, 32);
    this.game.load.spritesheet('dozer', 'images/dozer.png?' + d, 40, 32);
    this.game.load.spritesheet('door', 'images/door.png?' + d, 42, 66);
    this.game.load.spritesheet('doorSwitch', 'images/switch.png?' + d, 42, 42);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png?' + d, 34, 30);
    this.game.load.image('water', 'images/water.png?' + d);

    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');
    this.game.load.audio('bgm', ['audio/cottonjoe.m4a']);
    this.game.load.audio('bgm2', ['audio/electricavenue.m4a']);
    this.game.load.audio('bgm3', ['audio/ymca.m4a']);
};

LoadingState.create = function () {    
    this.game.state.start('play', true, false, {level: 0});
};

// =============================================================================
// Play state
// =============================================================================

PlayState = {};

const LEVEL_COUNT = 3;

PlayState.init = function (data) {
    this.keys = this.game.input.keyboard.addKeys({
        pkey: Phaser.Keyboard.P,
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP,
        action: Phaser.KeyCode.SPACEBAR
    });

    this.hasKey = false;
    this.level = (data.level || 0) % LEVEL_COUNT;
};

PlayState.create = function () {
    shown = new Array(); 
    // fade in (from black)
    this.camera.flash('#000000');

    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        key: this.game.add.audio('sfx:key'),
        stomp: this.game.add.audio('sfx:stomp'),
        door: this.game.add.audio('sfx:door')
    };
    var musicChoice = Math.floor(Math.random() * 3);
    if (musicChoice == 0) {
        this.bgm = this.game.add.audio('bgm');
    } 
    if (musicChoice == 1) {
        this.bgm = this.game.add.audio('bgm2');
    }
    if (musicChoice == 2) {
        this.bgm = this.game.add.audio('bgm3');
    }

    this.bgm.loopFull();

    // create level entities and decoration
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));

    // create UI score boards
    this._createHud();    

    // this.gamepad = this.game.plugins.add(Phaser.Plugin.VirtualGamepad);
    // this.joystick = this.gamepad.addJoystick(100, 420, 1.2, 'gamepad');
    // this.button = this.gamepad.addButton(850, 420, 1.0, 'gamepad');
    if (gameStarted == 0) {        
        startmenu = this.game.add.image(0, 0, 'startmenu');
        setTimeout(function() {
            this.game.paused = true;
        },1000);        
        this.game.input.keyboard.onPressCallback = 
        function () {
            console.log('Game Pause');
            this.game.paused = false;
            gameStarted = 1;
            startmenu.destroy();
        }
    }
};

PlayState.gofull = function () {
    /* Go Full Screen */
    this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.startFullScreen(false);
}

PlayState._onHeroVsSwitch = function (hero, doorSwitch) {
  this.keys.action.onDown.add(function () {
    this.sfx.door.play();

    doorSwitch.animations.play('pull');
    this.pullDoor.kill();
    // this.game.physics.disable(doorSwitch)
    // doorSwitch.activated = true;
}, this);
};

PlayState._spawnWater = function (x, y) {
  this.water = this.bgDecoration.create(x, y, 'water');

  this.game.physics.enable(this.water);
  this.pullDoor.body.immovable = true;
  this.pullDoor.body.allowGravity = false;
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();

    // update scoreboards
    this.coinFont.text = `x${coinPickupCount}`;
    this.numberLivesFont.text = `x${numberLivesCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;    
};

PlayState.shutdown = function () {
    this.bgm.stop();
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.hero, this.pullDoor);
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    this.game.physics.arcade.collide(this.hero, this.pullDoor);
    this.game.physics.arcade.collide(this.hero, this.water, function () {
        this.hero.die();        
        var level = this.level;
        numberLivesCount = numberLivesCount - 1;
        this.hero.events.onKilled.addOnce(function () {
            if (numberLivesCount < 1) {
                this.game.add.image(200, 90, 'txt-watergame');
                alert("Game Over - Press any key to play again.");
                numberLivesCount = 3;
                coinPickupCount = 0;
                gameStarted = 0;
                this.game.state.restart(true, false, {level: 0});
            } else {
                this.game.add.image(175, 100, 'txt-watergame');
                setTimeout(function() {
                    console.log("This Level: " + level);
                    this.game.state.restart(true, false, {level: level});
                }, 3000);
            }
        }, this);        
    }, null, this);
    this.game.physics.arcade.collide(this.platforms, this.water);
    this.game.physics.arcade.collide(this.pullDoor, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.spiders, this.pullDoor);

    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, null, this);
    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey, null, this);
    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoorNoKey,
        function (hero, door) {
            return !this.hasKey && hero.body.touching.down;
        }, this);
    this.game.physics.arcade.overlap(this.hero, this.spiders, this._onHeroVsEnemy, null, this);
    this.game.physics.arcade.overlap(this.hero, this.doorSwitch, this._onHeroVsSwitch, null, this);
};

PlayState._handleInput = function () {
    if (this.keys.pkey.isDown) {
        if (this.game.paused) { this.game.paused = false; }
        this.game.state.restart(true, false, {level: this.level + 1});
    }
    if (this.keys.left.isDown) {
        if (this.game.paused) { this.game.paused = false; }
        this.txtintro.destroy();
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) {
        if (this.game.paused) { this.game.paused = false; }
        this.txtintro.destroy();
        this.hero.move(1);   
    }
    else { // stop
        this.hero.move(0);
    }

    // Dialog Bits
    if (this.level == 0 && (this.hero.x > 150 & this.hero.x < 155)) {

        // if (!shown['dialog-1']) {
        //     var textbox = game.add.sprite(200, 540,'textbox');
        //     var dialog  = game.add.bitmapText(300, 560, 'carrier_command', 'The doors locked...\nhave to find the key?', 14);        
        //     game.time.events.add(Phaser.Timer.SECOND * 3, function() {
        //         dialog.text = "";
        //         textbox.destroy();
        //     }, this);
        // }
        // shown['dialog-1'] = true;
    }

    // handle jump
    const JUMP_HOLD = 200; // ms
    if (this.keys.up.downDuration(JUMP_HOLD)) {
        let didJump = this.hero.jump();
        if (didJump) { this.sfx.jump.play(); }
    }
    else {
        this.hero.stopJumpBoost();
    }
};

PlayState._deleteText = function() {
    console.log('Deleting Text');
    textbox.destroy();
    dialog.destroy();
}

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
};

PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    coinPickupCount++;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    // the hero can kill enemies when is falling (after a jump, or a fall)
    if (hero.body.velocity.y > 0) {
        enemy.die();
        hero.bounce();
        this.sfx.stomp.play();
        coinPickupCount += 5;
    }
    else {        
        hero.die();
        this.sfx.stomp.play();
        hero.events.onKilled.addOnce(function () {
            numberLivesCount -= 1;
            console.log("Number of lives: " + numberLivesCount);
            if (numberLivesCount < 1) {
                var textbox = game.add.sprite(200, 540,'textbox');
                var dialog  = game.add.bitmapText(300, 550, 'carrier_command', 'GAME OVER\n\nPress Any Key To Play Again', 14);                
                this.game.input.keyboard.onPressCallback = 
                function () {
                    console.log('Game Pause');
                    dialog.text = "";
                    textbox.destroy();
                    this.game.paused = false;
                    numberLivesCount = 3;
                    gameStarted = 0;
                    coinPickupCount = 0;
                    this.game.state.restart(true, false, {level: 0});
                };
                this.game.paused = true;
            } else {                
                this.game.state.restart(true, false, {level: this.level});
            }
        }, this);

        // NOTE: bug in phaser in which it modifies 'touching' when
        // checking for overlaps. This undoes that change so spiders don't
        // 'bounce' agains the hero
        enemy.body.touching = enemy.body.wasTouching;
    }
};

PlayState._onHeroVsDoorNoKey = function (hero, door) {
    if (this.level == 0) {
        var textbox = game.add.sprite(200, 540,'textbox');
        var dialog  = game.add.bitmapText(300, 550, 'carrier_command', 
            'The door\'s locked...\n\nWhere is that key?', 14);        
        game.time.events.add(Phaser.Timer.SECOND * 0, function() {
            dialog.text = "";
            textbox.destroy();
        }, this);
    }
}

PlayState._onHeroVsDoor = function (hero, door) {
    // 'open' the door by changing its graphic and playing a sfx
    door.frame = 1;
    this.sfx.door.play();

    // play 'enter door' animation and change to the next level when it ends
    hero.freeze();
    this.game.add.tween(hero)
    .to({x: this.door.x, alpha: 0}, 500, null, true)
    .onComplete.addOnce(this._goToNextLevel, this);
};

PlayState._goToNextLevel = function () {
    this.camera.fade('#000000');
    this.camera.onFadeComplete.addOnce(function () {
        // change to next level
        this.game.state.restart(true, false, {
            level: this.level + 1
        });
    }, this);
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need

    this.bgDecoration = this.game.add.group();
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    // spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});

    // spawn level decoration
    data.decoration.forEach(function (deco) {
        this.bgDecoration.add(
            this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
    }, this);
    
    // font = game.add.retroFont('carrier_command', 31, 25, Phaser.RetroFont.TEXT_SET6, 10, 1, 1);
    // font.text = "Where is everyone?";

    var TmpImg = game.cache.getImage('txtintro' + this.level);
    var x = game.world.centerX - (TmpImg.width/2);
    var y = game.world.centerY - (TmpImg.height/2);
    this.txtintro = game.add.sprite(x, y,'txtintro' + this.level);
    
    // spawn platforms
    data.platforms.forEach(this._spawnPlatform, this);

    if (data.doorBoxes) {
        this._spawnPullDoor(data.doorBoxes, data.doorSwitch);
    }

    if (data.water) {
        this._spawnWater(data.water.x, data.water.y);
    }

    // spawn important objects
    data.coins.forEach(this._spawnCoin, this);
    this._spawnKey(data.key.x, data.key.y);
    
    this._spawnDoor(data.door.x, data.door.y);

    // enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
    // this.game.paused = true;
};

PlayState._spawnPullDoor = function (door, doorSwitch) {
  this.pullDoor = this.bgDecoration.create(door.x, door.y, 'boxes');
  this.game.physics.enable(this.pullDoor);
  this.pullDoor.body.immovable = true;
  this.pullDoor.body.allowGravity = false;

  this.doorSwitch = this.bgDecoration.create(doorSwitch.x, doorSwitch.y, 'doorSwitch', 0);
  this.doorSwitch.animations.add('pull', [1], 1);
  this.game.physics.enable(this.doorSwitch);
  this.doorSwitch.body.allowGravity = false;
};

PlayState._spawnDoor = function (x, y) {
  this.door = this.bgDecoration.create(x, y, 'door');
  this.door.anchor.setTo(0.5, 1);
  this.game.physics.enable(this.door);
  this.door.body.allowGravity = false;
};

PlayState._spawnCharacters = function (data) {
    // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);

    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    // physics for platform sprites
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    // spawn invisible walls at each side, only detectable by enemies
    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);

    // physics (so we can detect overlap with the hero)
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    // animations
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
};

PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the key up
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;

    // add a small 'up & down' animation via a tween
    this.key.y -= 3;
    this.game.add.tween(this.key)
    .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
    .yoyo(true)
    .loop()
    .start();
};

PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};

PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';

    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR, 6);
    this.numberLivesFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR, 6);

    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);
    
    numberLivesIcon = this.game.make.image(0, 19, 'hero_stopped');
    numberLivesIcon.anchor.set(0, -1);

    let numberLivesImg = this.game.make.image(numberLivesIcon.x + numberLivesIcon.width,
        numberLivesIcon.height, this.numberLivesFont);
    numberLivesImg.anchor.set(0, -1);

    let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
        coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);

    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.add(coinScoreImg);
    this.hud.add(numberLivesIcon);
    this.hud.add(numberLivesImg);
    this.hud.add(this.keyIcon);
    this.hud.position.set(10, 10);
};

// =============================================================================
// entry point
// =============================================================================

window.onload = function () {
    numberLivesCount = 3;
    coinPickupCount = 0;
    gameStarted = 0;
};

