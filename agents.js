class Agent {
    constructor(gameController, x, y, width, height) {
        this.gameController = gameController;

        // Common properties
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.direction = { x: 0, y: 0 };
        this.width = width; 
        this.height = height;
    }

    update() {

    }

    draw(ctx) {

    }

    // Common utility methods
    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getBoundingBox() {

    }

}

// Add this new class between Agent and the specific character classes
class SpriteCharacter extends Agent {
    constructor(gameController, x, y, width, height, spriteConfig) {
        super(gameController, x, y, width, height);
        this.drawXOffset = 28;
        this.drawYOffset = 55;
        // Create animators for all directions and states
        this.animations = {
            walkRight: new Animator(
                ASSET_MANAGER.getAsset(spriteConfig.spritePath), // spritesheet: The image containing all animation frames
                spriteConfig.SIZE.WIDTH * spriteConfig.ANIMATION.COLUMNS.RIGHT,                                      // xStart: Starting X position on spritesheet for this animation
                spriteConfig.SIZE.HEIGHT * spriteConfig.ANIMATION.ROWS.RIGHT,                                       // yStart: Starting Y position on spritesheet for this animation
                spriteConfig.SIZE.WIDTH,                                        // width: Width of each frame in the animation
                spriteConfig.SIZE.HEIGHT,                                         // height: Height of each frame in the animation
                spriteConfig.ANIMATION.FRAMES,                                               // frameCount: Number of frames in this animation sequence
                spriteConfig.FRAME_DURATION,                                             // frameDuration: Time each frame is displayed (in seconds)
                spriteConfig.SCALE                               // scale: Size multiplier for drawing the sprite
            ),
            walkUp: new Animator(
                ASSET_MANAGER.getAsset(spriteConfig.spritePath), 
                spriteConfig.SIZE.WIDTH * spriteConfig.ANIMATION.COLUMNS.UP,
                spriteConfig.SIZE.HEIGHT * spriteConfig.ANIMATION.ROWS.UP,
                spriteConfig.SIZE.WIDTH, 
                spriteConfig.SIZE.HEIGHT,
                spriteConfig.ANIMATION.FRAMES,
                spriteConfig.FRAME_DURATION,
                spriteConfig.SCALE
            ),
            walkLeft: new Animator(
                ASSET_MANAGER.getAsset(spriteConfig.spritePath), 
                spriteConfig.SIZE.WIDTH * spriteConfig.ANIMATION.COLUMNS.LEFT,
                spriteConfig.SIZE.HEIGHT * spriteConfig.ANIMATION.ROWS.LEFT,
                spriteConfig.SIZE.WIDTH, 
                spriteConfig.SIZE.HEIGHT,
                spriteConfig.ANIMATION.FRAMES,
                spriteConfig.FRAME_DURATION,
                spriteConfig.SCALE
            ),
            walkDown: new Animator(
                ASSET_MANAGER.getAsset(spriteConfig.spritePath), 
                spriteConfig.SIZE.WIDTH * spriteConfig.ANIMATION.COLUMNS.DOWN,
                spriteConfig.SIZE.HEIGHT * spriteConfig.ANIMATION.ROWS.DOWN,
                spriteConfig.SIZE.WIDTH, 
                spriteConfig.SIZE.HEIGHT,
                spriteConfig.ANIMATION.FRAMES,
                spriteConfig.FRAME_DURATION,
                spriteConfig.SCALE
            ),
            idleRight: new Animator(
                ASSET_MANAGER.getAsset(spriteConfig.spritePath), 
                spriteConfig.SIZE.WIDTH * (spriteConfig.ANIMATION.COLUMNS.RIGHT+1),
                spriteConfig.SIZE.HEIGHT * spriteConfig.ANIMATION.ROWS.RIGHT,
                spriteConfig.SIZE.WIDTH, 
                spriteConfig.SIZE.HEIGHT,
                1,
                1,
                spriteConfig.SCALE
            ),
            idleUp: new Animator(
                ASSET_MANAGER.getAsset(spriteConfig.spritePath), 
                spriteConfig.SIZE.WIDTH * (spriteConfig.ANIMATION.COLUMNS.UP+1),
                spriteConfig.SIZE.HEIGHT * spriteConfig.ANIMATION.ROWS.UP,
                spriteConfig.SIZE.WIDTH, 
                spriteConfig.SIZE.HEIGHT,
                1,
                1,
                spriteConfig.SCALE
            ),
            idleLeft: new Animator(
                ASSET_MANAGER.getAsset(spriteConfig.spritePath), 
                spriteConfig.SIZE.WIDTH * (spriteConfig.ANIMATION.COLUMNS.LEFT+1),
                spriteConfig.SIZE.HEIGHT * spriteConfig.ANIMATION.ROWS.LEFT,
                spriteConfig.SIZE.WIDTH, 
                spriteConfig.SIZE.HEIGHT,
                1,
                1,
                spriteConfig.SCALE
            ),
            idleDown: new Animator(
                ASSET_MANAGER.getAsset(spriteConfig.spritePath), 
                spriteConfig.SIZE.WIDTH * (spriteConfig.ANIMATION.COLUMNS.DOWN+1),
                spriteConfig.SIZE.HEIGHT * spriteConfig.ANIMATION.ROWS.DOWN,
                spriteConfig.SIZE.WIDTH, 
                spriteConfig.SIZE.HEIGHT,
                1,
                1,
                spriteConfig.SCALE
            )
        };
        
        this.currentAnimation = this.animations.idleDown;
        this.facing = 'down';
        this.boundingBox = new BoundingBox(x, y, (width * .5) * params.scale, (height*.5) * params.scale);
    }

    update() {

    }

    draw(ctx) {
        // Draw current animation
        this.currentAnimation.drawFrame(
            this.gameController.gameEngine.clockTick,
            ctx,
            (this.x-this.drawXOffset) - this.gameController.gameStates.playing.camera.x,
            (this.y-this.drawYOffset) - this.gameController.gameStates.playing.camera.y
        );

        // Debug: draw bounding box
        const debugCheckbox = document.getElementById('debug');
        if (!debugCheckbox.checked) return;
        
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            this.boundingBox.x - this.gameController.gameStates.playing.camera.x,
            this.boundingBox.y - this.gameController.gameStates.playing.camera.y,
            this.boundingBox.width,
            this.boundingBox.height
        );
    }

    getBoundingBox() {
        return this.boundingBox;
    }
}


class Mike extends SpriteCharacter {
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
        this.speed = 1;
    }
}

class Jake extends SpriteCharacter {
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
        this.speed = 1;
        this.currentAnimation = this.animations.idleRight;
        this.facing = 'right';
        
        // Add pathfinding properties
        this.pathfinder = null;
        this.currentPath = null;
        this.pathUpdateTimer = 0;
        this.pathUpdateInterval = 500;
        this.isFollowing = false;  // Control follow behavior
        this.lastPlayerPos = { x: 0, y: 0 };
        this.pathfindingDelay = false;
        
        // Add room transition properties
        this.currentRoom = null;
        this.spawnDelay = 500; // Shorter delay than rat
        this.spawnTimer = 0;
        this.isSpawning = false;
        this.isHiding = false;
        

        this.z = 0;
    }

    update() {
        try {
            // Initialize pathfinder if not already done
            if (!this.pathfinder && this.gameController.gameStates.playing) {
                this.pathfinder = new AStar(this.gameController.gameStates.playing.worldManager);
            }

            const player = this.gameController.gameStates.playing.player;
            if (!player) return;

            // Check if player has moved significantly (possible door teleport)
            const playerMovedFar = Math.abs(this.lastPlayerPos.x - player.x) > 100 || 
                                 Math.abs(this.lastPlayerPos.y - player.y) > 100;

            if (playerMovedFar) {
                this.handleRoomTransition();
            }

            // Update last known player position
            this.lastPlayerPos = { x: player.x, y: player.y };

            // Handle spawn timer
            if (this.isSpawning && Date.now() - this.spawnTimer >= this.spawnDelay) {
                this.isSpawning = false;
                this.isHiding = false;
            }

            // Only follow if not spawning/hiding
            if (!this.isHiding && !this.isSpawning && this.isFollowing && !this.pathfindingDelay) {
                this.followPlayer(player);
            }

            // Update bounding box
            this.boundingBox.update(this.x, this.y);

        } catch (error) {
            console.error("Update error:", error);
            this.isFollowing = false;
        }
    }

    handleRoomTransition() {
        if (!this.isFollowing) return;

        // Find the door the player just used
        const doors = this.gameController.gameStates.playing.worldManager.doors;
        const playerPos = this.gameController.gameStates.playing.player;

        let nearestDoor = null;
        let shortestDistance = Infinity;

        doors.forEach(door => {
            const dx = door.x - playerPos.x;
            const dy = door.y - playerPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < shortestDistance && distance < 150) {
                shortestDistance = distance;
                nearestDoor = door;
            }
        });

        if (nearestDoor) {
            // Set spawn position but don't show immediately
            this.x = nearestDoor.x;
            this.y = nearestDoor.y;
            this.currentRoom = this.gameController.gameStates.playing.worldManager.getCurrentRoom(playerPos);
            
            // Start spawn timer
            this.isSpawning = true;
            this.spawnTimer = Date.now();
            this.isHiding = true;
            
            // Clear current path when changing rooms
            this.currentPath = null;
        }
    }

    followPlayer(player) {
        if (!this.pathfinder) return;

        // Add a minimum distance check before attempting to path to player
        const distanceToPlayer = Math.sqrt(
            Math.pow(player.x - this.x, 2) + 
            Math.pow(player.y - this.y, 2)
        );

        // If we're already close to the player, stop moving and update animation
        if (distanceToPlayer < 64) { // Adjust this value as needed (64 = 2 tiles)
            this.currentPath = null;
            // Set idle animation based on current facing direction
            this.currentAnimation = this.animations[`idle${this.facing.charAt(0).toUpperCase() + this.facing.slice(1)}`];
            return;
        }

        // Update path periodically
        if (!this.currentPath || Date.now() - this.pathUpdateTimer > this.pathUpdateInterval) {
            try {
                let newPath = this.pathfinder.findPath(
                    this.x,
                    this.y,
                    player.x,
                    player.y,
                    this.gameController.gameStates.playing.worldManager.getCurrentRoom(this),
                    this.gameController.gameStates.playing.worldManager.worldObjects
                );

                if (newPath && newPath.length > 0 && newPath.length < 100) {
                    this.currentPath = newPath;
                } else {
                    this.currentPath = [{x: player.x, y: player.y}];
                }
                this.pathUpdateTimer = Date.now();

            } catch (error) {
                console.warn("Pathfinding error:", error);
                this.currentPath = [{x: player.x, y: player.y}];
            }
        }

        // Follow path
        if (this.currentPath && this.currentPath.length > 0) {
            const target = this.currentPath[0];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Move to next waypoint if close enough
            if (distance < 32) {
                this.currentPath.shift();
                // If no more waypoints and close to player, switch to idle
                if (this.currentPath.length === 0) {
                    this.currentAnimation = this.animations[`idle${this.facing.charAt(0).toUpperCase() + this.facing.slice(1)}`];
                }
                return;
            }

            // Move towards target
            if (distance > 0) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;

                // Update animation based on movement direction
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) {
                        this.currentAnimation = this.animations.walkRight;
                        this.facing = 'right';
                    } else {
                        this.currentAnimation = this.animations.walkLeft;
                        this.facing = 'left';
                    }
                } else {
                    if (dy > 0) {
                        this.currentAnimation = this.animations.walkDown;
                        this.facing = 'down';
                    } else {
                        this.currentAnimation = this.animations.walkUp;
                        this.facing = 'up';
                    }
                }
            }
        }
    }

    // Control methods
    startFollowing() {
        this.isFollowing = true;
        console.log("Jake is following");
    }

    stopFollowing() {
        this.isFollowing = false;
        this.currentPath = null;
        console.log("Jake stopped following");
    }

    draw(ctx) {
        // Only draw if not hiding
        if (!this.isHiding) {
            // Calculate z based on y position
            this.z = this.y;  // Basic z-ordering based on y position
            
            // Draw current animation
            this.currentAnimation.drawFrame(
                this.gameController.gameEngine.clockTick,
                ctx,
                (this.x-this.drawXOffset) - this.gameController.gameStates.playing.camera.x,
                (this.y-this.drawYOffset) - this.gameController.gameStates.playing.camera.y
            );

            // Debug information
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

                // Draw state information above character
                ctx.fillStyle = "cyan";
                ctx.strokeStyle = "black";
                ctx.font = "12px Arial";
                ctx.lineWidth = 2;
                
                const followText = `Following: ${this.isFollowing ? 'Yes' : 'No'}`;
                const roomText = `Room: ${this.currentRoom || 'None'}`;
                const positionText = `Pos: ${Math.floor(this.x/32)}, ${Math.floor(this.y/32)}`;
                const zText = `Z: ${Math.floor(this.z)}`;  // Add z-index display
                
                const xPos = this.x - this.gameController.gameStates.playing.camera.x;
                const yBase = this.y - this.gameController.gameStates.playing.camera.y - 85; // Adjusted to make room for z
                const lineHeight = 15;
                
                [zText, followText, roomText, positionText].forEach((text, i) => {
                    const yPos = yBase + (i * lineHeight);
                    ctx.strokeText(text, xPos, yPos);
                    ctx.fillText(text, xPos, yPos);
                });

                // Draw path if it exists
                if (this.currentPath) {
                    ctx.strokeStyle = 'cyan';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(
                        this.x - this.gameController.gameStates.playing.camera.x,
                        this.y - this.gameController.gameStates.playing.camera.y
                    );
                    this.currentPath.forEach(waypoint => {
                        ctx.lineTo(
                            waypoint.x - this.gameController.gameStates.playing.camera.x,
                            waypoint.y - this.gameController.gameStates.playing.camera.y
                        );
                    });
                    ctx.stroke();
                }
            }
        }
    }

    moveToLocation(targetX, targetY) {
        this.stopFollowing();
        this.isFollowing = true;
        
        // Create a one-time path to the target
        this.currentPath = this.pathfinder.findPath(
            this.x,
            this.y,
            targetX,
            targetY,
            this.currentRoom,
            this.gameController.gameStates.playing.worldManager.worldObjects
        );

        // Override the followPlayer method temporarily
        this.originalFollowPlayer = this.followPlayer;
        this.followPlayer = () => {
            if (this.currentPath && this.currentPath.length > 0) {
                const target = this.currentPath[0];
                const dx = target.x - this.x;
                const dy = target.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Move to next waypoint if close enough
                if (distance < 32) {
                    this.currentPath.shift();
                    if (this.currentPath.length === 0) {
                        // Restore original behavior when destination is reached
                        this.followPlayer = this.originalFollowPlayer;
                        this.stopFollowing();
                    }
                    return;
                }

                // Move towards target
                if (distance > 0) {
                    this.x += (dx / distance) * this.speed;
                    this.y += (dy / distance) * this.speed;

                    // Update animation based on movement direction
                    if (Math.abs(dx) > Math.abs(dy)) {
                        if (dx > 0) {
                            this.currentAnimation = this.animations.walkRight;
                            this.facing = 'right';
                        } else {
                            this.currentAnimation = this.animations.walkLeft;
                            this.facing = 'left';
                        }
                    } else {
                        if (dy > 0) {
                            this.currentAnimation = this.animations.walkDown;
                            this.facing = 'down';
                        } else {
                            this.currentAnimation = this.animations.walkUp;
                            this.facing = 'up';
                        }
                    }
                }
            }
        };
    }
}

class Lily extends SpriteCharacter {
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
        this.speed = 1;
    }
}


