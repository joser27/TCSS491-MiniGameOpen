class Camera {
    constructor(gameController,player) {
        this.gameController = gameController;
        this.player = player;
        this.x = 0;
        this.y = 0;
    }

    update() {
        if (this.player.isPaused) {
            return;
        }
        const scale = this.gameController.gameEngine.scale || 1;
        
        // Just update the camera position
        this.x = (this.player.x * scale) - (this.gameController.gameEngine.ctx.canvas.width / 2);
        this.y = (this.player.y * scale) - (this.gameController.gameEngine.ctx.canvas.height / 2);
    }

    draw(ctx) {

    }
}

