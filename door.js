class Door {
    constructor(gameController, x, y, width, height, destinationX, destinationY, isLocked = false, requiredKey = null) {
        this.gameController = gameController;
        this.x = x;
        this.y = y;
        
        this.camera = this.gameController.gameStates.playing.camera;
        this.width = width * params.scale;
        this.height = height * params.scale;
        this.destinationX = destinationX;
        this.destinationY = destinationY;
        
        // Properties for locking mechanism
        this.isLocked = isLocked;
        this.requiredKey = requiredKey;
        
        // Create bounding box with scaled dimensions
        this.boundingBox = new BoundingBox(
            x,
            y,
            width * params.scale,
            height * params.scale
        );
        
        // Create a larger bounding box for detecting player proximity
        this.interactionBox = new BoundingBox(
            x - 20, y - 20,
            (width * params.scale) + 40,
            (height * params.scale) + 40
        );
        
        this.teleportCooldown = 30; // cooldown to prevent rapid transitions
        this.doorSound = ASSET_MANAGER.getAsset("./assets/audio/mixkit-creaky-door-open-195.wav");
        this.lockedSound = ASSET_MANAGER.getAsset("./assets/audio/Locked Door Sound Effect.wav");

        // Add highlight state for visual feedback
        this.highlight = false;
        this.zIndex = 500;
        this.hasFixedZIndex = true;
    }

    update() {
        if (this.teleportCooldown > 0) {
            this.teleportCooldown--;
            return;
        }

        // Check if player is near the door
        if (this.gameController.gameState.player.boundingBox.collide(this.interactionBox)) {
            this.highlight = true;
            
            // Only interact on fresh key press
            if (this.gameController.gameEngine.consumeKeyPress('e')) {
                this.interact();
            }
        } else {
            this.highlight = false;
        }

        // Update interaction box position
        this.interactionBox.update(
            this.x - 20,
            this.y - 20
        );
    }

    interact() {
        // Check if door is locked
        if (this.isLocked) {
            // Check if player has the required key
            if (this.requiredKey && this.gameController.gameState.player.hasItem(this.requiredKey)) {
                // Unlock the door
                this.isLocked = false;
                // You might want to play an unlock sound here
            } else {
                // Play locked door sound
                this.lockedSound.currentTime = 0;
                this.lockedSound.play();
                return; // Don't teleport if door is locked
            }
        }

        // Normal door behavior
        this.doorSound.currentTime = 0;
        this.doorSound.play();
        
        // Add a small delay before teleporting to prevent any collision issues
        setTimeout(() => {
            this.gameController.gameState.player.x = this.destinationX;
            this.gameController.gameState.player.y = this.destinationY;
            this.gameController.gameState.player.boundingBox.update(this.destinationX, this.destinationY);
            this.teleportCooldown = 30;
        }, 100);
    }

    draw(ctx) {
            // Draw interaction prompt when highlighted
            if (this.highlight) {
                ctx.fillStyle = "white";
                ctx.font = "12px Arial";
                const promptText = this.isLocked && this.requiredKey 
                    ? `Press E to use (Needs: ${this.requiredKey})`
                    : "Press E to use";
                ctx.fillText(
                    promptText,
                    this.boundingBox.x - this.camera.x,
                    this.boundingBox.y - this.camera.y - 10
                );
            }
        // Debug visualization
        const debugCheckbox = document.getElementById('debug');
        if (debugCheckbox?.checked) {

            // Colors for locked/unlocked doors
            ctx.fillStyle = this.isLocked ? 'rgba(139, 0, 0, 0.5)' : 'rgba(139, 69, 19, 0.5)';
            ctx.fillRect(
                this.boundingBox.x - this.camera.x,
                this.boundingBox.y - this.camera.y,
                this.boundingBox.width,
                this.boundingBox.height
            );




            // Draw door bounding box
            ctx.strokeStyle = this.isLocked ? 'red' : 'purple';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.boundingBox.x - this.camera.x,
                this.boundingBox.y - this.camera.y,
                this.boundingBox.width,
                this.boundingBox.height
            );
            
            // Draw interaction box
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.interactionBox.x - this.camera.x,
                this.interactionBox.y - this.camera.y,
                this.interactionBox.width,
                this.interactionBox.height
            );
        }
    }
}