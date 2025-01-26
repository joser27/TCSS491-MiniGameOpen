class MenuState extends GameState {
    constructor(gameController) {
        super(gameController);
        this.removeFromWorld = false;
    }

    update() {
        if (this.gameController.gameEngine.keys["Enter"]) {
            this.gameController.gameStates.playing = new PlayingState(this.gameController);
            console.log(this.gameController.gameStates.playing)
            this.gameController.changeState(this.gameController.gameStates.playing);
            
            this.gameController.gameStates.playing.initEntities();
            this.gameController.gameEngine.addEntity(this.gameController.gameStates.playing);
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        ctx.font = '48px serif';
        ctx.fillStyle = 'Red';
        ctx.fillText('Press Enter to Start', 100, 100);
    }
}