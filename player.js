class Player extends SpriteCharacter {
    constructor(gameController, x, y, width, height) {
        const SPRITE = {
            spritePath: "./assets/images/characters2.png",
            SHEET: {
                WIDTH: 576,
                HEIGHT: 384,
                COLUMNS: 12,
                ROWS: 8
            },
            SIZE: {
                WIDTH: 576 / 12,
                HEIGHT: 384 / 8
            },
            SCALE: 1.5,
            FRAME_DURATION: 0.15,
            ANIMATION: {
                ROWS: {
                    RIGHT: 2,
                    UP: 3,
                    LEFT: 1,
                    DOWN: 0
                },
                COLUMNS: {
                    RIGHT: 6,
                    UP: 6,
                    LEFT: 6,
                    DOWN: 6
                },
                FRAMES: 3
            }
        };
        
        super(gameController, x, y, width, height, SPRITE);
        this.speed = 4;
        this.inventory = [];
        this.isPaused = false;
        this.z = 0;  
    }

    addToInventory(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
        }
    }

    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
        }
    }

    getInventory() {
        return this.inventory;
    }

    hasItem(item) {
        return this.inventory.includes(item);
    }

    update() {
        let newX = this.x;
        let newY = this.y;
        let moving = false;

        // Handle movement and animations
        if (this.gameController.gameEngine.keys['w']) {
            newY -= this.speed;
            this.currentAnimation = this.animations.walkUp;
            this.facing = 'up';
            moving = true;
        }
        if (this.gameController.gameEngine.keys['s']) {
            newY += this.speed;
            this.currentAnimation = this.animations.walkDown;
            this.facing = 'down';
            moving = true;
        }
        if (this.gameController.gameEngine.keys['a']) {
            newX -= this.speed;
            this.currentAnimation = this.animations.walkLeft;
            this.facing = 'left';
            moving = true;
        }
        if (this.gameController.gameEngine.keys['d']) {
            newX += this.speed;
            this.currentAnimation = this.animations.walkRight;
            this.facing = 'right';
            moving = true;
        }

        // If not moving, switch to idle animation
        if (!moving) {
            switch(this.facing) {
                case 'up': this.currentAnimation = this.animations.idleUp; break;
                case 'down': this.currentAnimation = this.animations.idleDown; break;
                case 'left': this.currentAnimation = this.animations.idleLeft; break;
                case 'right': this.currentAnimation = this.animations.idleRight; break;
            }
        }

        const worldManager = this.gameController.gameStates.playing.worldManager;
        
        // Test horizontal movement
        const horizontalBox = new BoundingBox(
            newX, 
            this.y, 
            (this.width * .5) * params.scale, 
            (this.height*.5) * params.scale
        );

        // Test vertical movement
        const verticalBox = new BoundingBox(
            this.x, 
            newY, 
            (this.width * .5) * params.scale, 
            (this.height*.5) * params.scale
        );

        // Check both wall and object collisions for horizontal movement
        let canMoveHorizontally = !worldManager.isCollidingWithWall(horizontalBox);
        if (canMoveHorizontally) {
            for (const object of worldManager.worldObjects) {
                if (object.isCollidingWith(horizontalBox)) {
                    canMoveHorizontally = false;
                    break;
                }
            }
        }

        // Check both wall and object collisions for vertical movement
        let canMoveVertically = !worldManager.isCollidingWithWall(verticalBox);
        if (canMoveVertically) {
            for (const object of worldManager.worldObjects) {
                if (object.isCollidingWith(verticalBox)) {
                    canMoveVertically = false;
                    break;
                }
            }
        }

        // Update position based on combined collision results
        if (canMoveHorizontally) {
            this.x = newX;
        }
        if (canMoveVertically) {
            this.y = newY;
        }

        // Update the actual bounding box with final position
        this.boundingBox.update(this.x, this.y);
    }

    draw(ctx) {
        // Update z based on y position
        this.z = this.y;

        // Draw current animation with offset for better positioning
        this.currentAnimation.drawFrame(
            this.gameController.gameEngine.clockTick,
            ctx,
            (this.x-this.drawXOffset) - this.gameController.gameStates.playing.camera.x,
            (this.y-this.drawYOffset) - this.gameController.gameStates.playing.camera.y
        );

        // Debug: draw bounding box and info
        const debugCheckbox = document.getElementById('debug');
        if (debugCheckbox.checked) {
            // Draw bounding box
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.boundingBox.x - this.gameController.gameStates.playing.camera.x,
                this.boundingBox.y - this.gameController.gameStates.playing.camera.y,
                this.boundingBox.width,
                this.boundingBox.height
            );

            // Draw debug info above player
            ctx.fillStyle = "cyan";
            ctx.strokeStyle = "black";
            ctx.font = "12px Arial";
            ctx.lineWidth = 2;
            
            const currentRoom = this.gameController.gameStates.playing.worldManager.getCurrentRoom(this);
            const zText = `Z: ${Math.floor(this.z)}`;
            const roomText = `Room: ${currentRoom || 'None'}`;
            const positionText = `Pos: ${Math.floor(this.x/32)}, ${Math.floor(this.y/32)}`;
            const followText = `Following: ${this.gameController.gameStates.playing.jake.isFollowing ? 'Yes' : 'No'}`;
            
            // Draw debug info above player
            const xPos = this.x - this.gameController.gameStates.playing.camera.x;
            const yBase = this.y - this.gameController.gameStates.playing.camera.y - 85;
            const lineHeight = 15;
            
            [zText, roomText, positionText, followText].forEach((text, i) => {
                const yPos = yBase + (i * lineHeight);
                ctx.strokeText(text, xPos, yPos);
                ctx.fillText(text, xPos, yPos);
            });

            // Draw debug info in top left (keep existing HUD info)
            const hudInfo = [roomText, positionText, followText];
            const xPosHud = 10;
            const yBaseHud = 100;
            
            hudInfo.forEach((text, i) => {
                const yPos = yBaseHud + (i * lineHeight);
                ctx.strokeText(text, xPosHud, yPos);
                ctx.fillText(text, xPosHud, yPos);
            });
        }
    }

    drawRoomInfo(ctx) {
        // Get and format current room name
        const currentRoom = this.gameController.gameStates.playing.worldManager.getCurrentRoom(this);
        const formattedRoomName = currentRoom.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Draw room name in top middle
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.font = "24px Arial";
        ctx.lineWidth = 3;
        const textWidth = ctx.measureText(formattedRoomName).width;
        const xPos = (ctx.canvas.width - textWidth) / 2;
        
        ctx.strokeText(formattedRoomName, xPos, 30);
        ctx.fillText(formattedRoomName, xPos, 30);

        // Draw position in top right
        ctx.font = "16px Arial";
        const gridX = Math.floor(this.x / (params.tileSize * params.scale));
        const gridY = Math.floor(this.y / (params.tileSize * params.scale));
        const posText = `Cell: ${gridX}, ${gridY}`;
        const posWidth = ctx.measureText(posText).width;
        const posXPos = ctx.canvas.width - posWidth - 10;
        
        ctx.strokeText(posText, posXPos, 30);
        ctx.fillText(posText, posXPos, 30);
    }
}