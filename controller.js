class Controller {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameStates = {
            menu: new MenuState(this),
            playing: null,
            inventory: null,
        }   
        this.gameState = this.gameStates.menu;
        this.gameEngine.addEntity(this);
        this.setupAudioControls();
        this.gameEngine.addEntity(this.gameStates.menu);
    }

    setupAudioControls() {

        document.getElementById("mute").addEventListener("change", () => this.updateAudio());
        document.getElementById("volume").addEventListener("input", () => this.updateAudio());

        this.updateAudio();
    }

    updateAudio() {
        const mute = document.getElementById("mute").checked;
        const volume = document.getElementById("volume").value;

        // Update all audio assets
        for (let path in ASSET_MANAGER.cache) {
            const asset = ASSET_MANAGER.getAsset(path);
            if (asset instanceof Audio) {
                asset.muted = mute;
                asset.volume = mute ? 0 : volume;
            }
        }
    }

    update() {
        
    }

    draw(ctx) {
        this.drawGrid(ctx);
    }

    drawGrid(ctx) {
        const gridCheckbox = document.getElementById('grid');
        if (!gridCheckbox.checked) return;


        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const tileSize = params.tileSize * params.scale;
        
        // Get camera position
        const camera = this.gameState.camera;
        
        // Set up grid style
        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 1;
        
        // Calculate world coordinates of the top-left corner of the screen
        const startWorldX = camera.x;
        const startWorldY = camera.y;
        
        // Calculate the first grid line positions
        const firstGridX = Math.floor(startWorldX / tileSize) * tileSize - startWorldX;
        const firstGridY = Math.floor(startWorldY / tileSize) * tileSize - startWorldY;
        
        // Draw vertical lines
        for (let x = firstGridX; x <= canvasWidth; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = firstGridY; y <= canvasHeight; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
        
        // Only draw coordinates if debug mode is also enabled
        const debugCheckbox = document.getElementById('debug');
        if (debugCheckbox.checked) {
            // Draw coordinates
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            // Calculate starting tile coordinates
            const startTileX = Math.floor(startWorldX / tileSize);
            const startTileY = Math.floor(startWorldY / tileSize);
            
            // Draw coordinates in each cell
            for (let x = firstGridX; x < canvasWidth; x += tileSize) {
                for (let y = firstGridY; y < canvasHeight; y += tileSize) {
                    const tileX = startTileX + Math.floor((x - firstGridX) / tileSize);
                    const tileY = startTileY + Math.floor((y - firstGridY) / tileSize);
                    ctx.fillText(`${tileX},${tileY}`, x + 2, y + 2);
                }
            }
        }
    }

    changeState(state) {
        this.gameState = state;
    }
}