class PlayingState extends GameState {
    constructor(gameController) {
        super(gameController);

        this.player = new Player(
            this.gameController, 
            (430 * params.tileSize) * params.scale,  //430
            (42 * params.tileSize) * params.scale,   //42
            params.tileSize, 
            params.tileSize

        );
        this.camera = new Camera(this.gameController, this.player);
        
        this.jake = new Jake(
            this.gameController, 
            (428 * params.tileSize) * params.scale,  
            (43 * params.tileSize) * params.scale,  
            params.tileSize, 
            params.tileSize
        );
        this.lily = new Lily(
            this.gameController, 
            (432 * params.tileSize) * params.scale,  
            (42 * params.tileSize) * params.scale,  
            params.tileSize, 
            params.tileSize
        );
        this.mike = new Mike(
            this.gameController, 
            (433 * params.tileSize) * params.scale,  
            (43 * params.tileSize) * params.scale,  
            params.tileSize, 
            params.tileSize
        );

        this.rat = new Rat(
            this.gameController, 
            (-135 * params.tileSize) * params.scale,
            (18 * params.tileSize) * params.scale, 
            params.tileSize, 
            params.tileSize
        );

        this.spider = new Spider(
            this.gameController, 
            (-135 * params.tileSize) * params.scale,
            (18 * params.tileSize) * params.scale, 
            params.tileSize, 
            params.tileSize

        );

        // Set initial room
        this.rat.currentRoom = "bathroom";
        this.spider.currentRoom = "bathroom";

        this.outsideAmbience = ASSET_MANAGER.getAsset("./assets/audio/night-cricket-ambience-22484.mp3");
        
        this.wasIPressed = false;
    }

    initEntities() {
        this.worldManager = new WorldManager(this.gameController);
        this.storyManager = new StoryManager(this.gameController, this.player, this.camera);
        this.gameController.gameEngine.addEntity(this.jake);
        this.gameController.gameEngine.addEntity(this.lily);
        this.gameController.gameEngine.addEntity(this.mike);
        this.gameController.gameEngine.addEntity(this.player);
        // this.gameController.gameEngine.addEntity(this.rat);
        this.gameController.gameEngine.addEntity(this.spider);
        this.gameController.gameEngine.addEntity(this.storyManager);
        this.gameController.gameEngine.addEntity(this.worldManager);
        this.gameController.gameEngine.addEntity(this.camera);

        this.worldManager.zIndex = 100;
        
        this.mike.zIndex = 200;
        this.lily.zIndex = 200;
        this.jake.zIndex = 200;
        this.player.zIndex = 200;
        this.rat.zIndex = 200;
        
        this.camera.zIndex = 200;
        

        this.storyManager.zIndex = 5000;

        this.storyManager.triggerEvent('gameIntro');
    }
    pauseEntities() {
        this.jake.isPaused = true;
        this.lily.isPaused = true;
        this.mike.isPaused = true;
        this.player.isPaused = true;
        this.rat.isPaused = true;
        this.camera.isPaused = true;
        this.storyManager.isPaused = true;
        this.worldManager.isPaused = true;
    }

    update() {
       
        if (this.gameController.gameEngine.consumeKeyPress('i') && !this.gameController.gameStates.inventory) {
            this.player.isPaused = true;
            this.isPaused = true;
            const inventoryState = new InventoryState(this.gameController, this.gameController.gameStates.playing);
            this.gameController.gameStates.inventory = inventoryState;
            this.gameController.gameEngine.addEntity(inventoryState);
            this.gameController.changeState(this.gameController.gameStates.inventory);
            return; 
        }

        if (this.worldManager.getCurrentRoom(this.player) === "outside") {
            if (this.outsideAmbience.paused) {
                this.outsideAmbience.play();
            }
        } else {
            if (!this.outsideAmbience.paused) {
                this.outsideAmbience.pause();
                this.outsideAmbience.currentTime = 0;
            }
        }

        if (this.gameController.gameEngine.keys["Escape"]) {
            this.gameController.changeState(this.gameController.gameStates.menu);
        }

        

        if (!this.storyManager.flags.hasSplitUp && 
            this.worldManager.getCurrentRoom(this.player) === "foyer_floor1") {
            this.storyManager.triggerEvent('splitUpSequence');
        }
    }

    draw(ctx) {

    }
}
