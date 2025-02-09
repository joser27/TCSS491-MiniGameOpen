class LightManager {
    constructor(gameController) {
        this.gameController = gameController;
        
        // Create overlay canvas matching the game canvas size
        const gameCanvas = this.gameController.gameEngine.ctx.canvas;
        this.lightCanvas = document.createElement('canvas');
        this.lightCanvas.width = gameCanvas.width;
        this.lightCanvas.height = gameCanvas.height;
        this.lightCtx = this.lightCanvas.getContext('2d');
        
        // Fixed light properties
        this.ambientLight = 0.85;  
        this.lightRadius = 200;
        this.zIndex = 1000;
    }

    update() {
        const camera = this.gameController.gameStates.playing.camera;
        
        // Clear the light canvas
        this.lightCtx.clearRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
        
        // Fill with dark overlay
        this.lightCtx.fillStyle = `rgba(0, 0, 0, ${this.ambientLight})`;
        this.lightCtx.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
        
        // Add player light
        const player = this.gameController.gameStates.playing.player;
        this.addLight(
            player.x - camera.x,
            player.y - camera.y
        );
        
        // Add Jake's light if following
        const jake = this.gameController.gameStates.playing.jake;
        if (jake && jake.isFollowing && !jake.isHiding) {
            this.addLight(
                jake.x - camera.x,
                jake.y - camera.y,
                this.lightRadius * 0.8  
            );
        }
    }

    addLight(x, y, radius = this.lightRadius) {
        // Create a radial gradient for smooth light falloff
        const gradient = this.lightCtx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');      // Center of light (fully transparent)
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');  // Mid transition
        gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.3)');  // Soft outer transition
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');      // Edge of light (fully opaque)
        
        // Cut out the light from the darkness
        this.lightCtx.globalCompositeOperation = 'destination-out';
        this.lightCtx.fillStyle = gradient;
        this.lightCtx.beginPath();
        this.lightCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.lightCtx.fill();
        this.lightCtx.globalCompositeOperation = 'source-over';
    }

    draw(ctx) {
        ctx.drawImage(this.lightCanvas, 0, 0);
    }
}