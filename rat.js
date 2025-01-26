class Rat extends Agent {
    constructor(gameController, x, y, width, height) {
        super(gameController, x, y, width, height);
        this.speed = 2.5;
        
        // Define rat sprite sheet layout
        const RAT_SPRITE = {
            SHEET: {
                WIDTH: 284,    // Total width of sprite sheet
                HEIGHT: 232,   // Total height of sprite sheet
                COLUMNS: 4,    // Total columns in sprite sheet
                ROWS: 4        // Total rows in sprite sheet
            },
            SIZE: {
                WIDTH: 284 / 4,   // Width of each frame
                HEIGHT: 232 / 4   // Height of each frame
            },
            SCALE: 2,
            FRAME_DURATION: 0.2,
            ANIMATION: {
                ROWS: {
                    DOWN: 0,
                    LEFT: 1,
                    RIGHT: 2,
                    UP: 3
                },
                FRAMES: 4     // Each animation has 4 frames
            }
        };
        
        // Create animators for each direction
        this.animations = {
            walkRight: new Animator(
                ASSET_MANAGER.getAsset("./assets/art/rat.png"), 
                0,                                              // x start
                RAT_SPRITE.SIZE.HEIGHT * RAT_SPRITE.ANIMATION.ROWS.RIGHT,  // y start
                RAT_SPRITE.SIZE.WIDTH, 
                RAT_SPRITE.SIZE.HEIGHT,
                RAT_SPRITE.ANIMATION.FRAMES,
                RAT_SPRITE.FRAME_DURATION,
                RAT_SPRITE.SCALE
            ),
            walkLeft: new Animator(
                ASSET_MANAGER.getAsset("./assets/art/rat.png"), 
                0,
                RAT_SPRITE.SIZE.HEIGHT * RAT_SPRITE.ANIMATION.ROWS.LEFT,
                RAT_SPRITE.SIZE.WIDTH,
                RAT_SPRITE.SIZE.HEIGHT,
                RAT_SPRITE.ANIMATION.FRAMES,
                RAT_SPRITE.FRAME_DURATION,
                RAT_SPRITE.SCALE
            ),
            walkUp: new Animator(
                ASSET_MANAGER.getAsset("./assets/art/rat.png"), 
                0,
                RAT_SPRITE.SIZE.HEIGHT * RAT_SPRITE.ANIMATION.ROWS.UP,
                RAT_SPRITE.SIZE.WIDTH,
                RAT_SPRITE.SIZE.HEIGHT,
                RAT_SPRITE.ANIMATION.FRAMES,
                RAT_SPRITE.FRAME_DURATION,
                RAT_SPRITE.SCALE
            ),
            walkDown: new Animator(
                ASSET_MANAGER.getAsset("./assets/art/rat.png"), 
                0,
                RAT_SPRITE.SIZE.HEIGHT * RAT_SPRITE.ANIMATION.ROWS.DOWN,
                RAT_SPRITE.SIZE.WIDTH,
                RAT_SPRITE.SIZE.HEIGHT,
                RAT_SPRITE.ANIMATION.FRAMES,
                RAT_SPRITE.FRAME_DURATION,
                RAT_SPRITE.SCALE
            )
        };
        
        this.currentAnimation = this.animations.walkDown;  // Default animation
        this.facing = 'down';
        
        // bounding box
        this.boundingBox = new BoundingBox(x, y, (width*1.5) * params.scale, (height*1.5) * params.scale);
        
        // room-based behavior
        this.currentRoom = null;
        this.isHiding = false;

        this.spawnDelay = 1000;
        this.spawnTimer = 0;  
        this.isSpawning = false; 

        this.pathfinder = null;
        this.currentPath = null;
        this.pathUpdateTimer = 0;
        this.pathUpdateInterval = 500; 


        this.lastTargetX = 0;
        this.lastTargetY = 0;

        // Add state control
        this.isChasing = false;  // New property to control chase behavior
        
        // Add door transition handling
        this.lastPlayerPos = { x: 0, y: 0 };
        this.pathfindingDelay = false;
    }

    update() {
        try {
            // Initialize pathfinder if not already done
            if (!this.pathfinder && this.gameController.gameStates.playing) {
                this.pathfinder = new AStar(this.gameController.gameStates.playing.worldManager);
            }

            const player = this.gameController.gameStates.playing.player;
            if (!player) {
                console.warn("Player not found");
                return;
            }

            // Only track room changes and handle transitions if chasing
            if (this.isChasing) {
                const playerRoom = this.gameController.gameStates.playing.worldManager.getCurrentRoom(player);

                // Check if player has moved significantly (possible door teleport)
                const playerMovedFar = Math.abs(this.lastPlayerPos.x - player.x) > 100 || 
                                    Math.abs(this.lastPlayerPos.y - player.y) > 100;

                if (playerMovedFar) {
                    // Player might have used a door, delay pathfinding briefly
                    this.pathfindingDelay = true;
                    this.currentPath = null;
                    setTimeout(() => {
                        this.pathfindingDelay = false;
                    }, 500); // Half second delay
                }

                // Update last known player position
                this.lastPlayerPos = { x: player.x, y: player.y };

                // Check if player changed rooms
                if (this.currentRoom !== playerRoom) {
                    this.handleRoomTransition(playerRoom);
                }
            }

            // Handle spawn timer
            if (this.isSpawning && Date.now() - this.spawnTimer >= this.spawnDelay) {
                this.isSpawning = false;
                this.isHiding = false;
            }

            // Only chase if all conditions are met
            if (!this.isHiding && !this.isSpawning && 
                this.currentRoom === this.gameController.gameStates.playing.worldManager.getCurrentRoom(player) && 
                this.isChasing && !this.pathfindingDelay) {
                try {
                    this.chasePlayer(player);
                } catch (error) {
                    console.warn("Pathfinding error:", error);
                    this.currentPath = null;
                }
            }

            // Update bounding box
            this.boundingBox.update(this.x, this.y);

        } catch (error) {
            console.error("Critical update error:", error);
            this.isChasing = false; // Stop chasing on critical errors
        }
    }

    handleRoomTransition(newPlayerRoom) {
        // Only handle room transitions if actively chasing
        if (!this.isChasing) return;

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
            this.currentRoom = newPlayerRoom;
            
            // Start spawn timer
            this.isSpawning = true;
            this.spawnTimer = Date.now();
            this.isHiding = true; // Hide the rat during spawn delay
            
            // Clear current path when changing rooms
            this.currentPath = null;
        }
    }

    chasePlayer(player) {
        // Only update path if we're actually chasing
        if (!this.isChasing) return;

        // Add safety check for pathfinder
        if (!this.pathfinder) {
            console.warn("Pathfinder not initialized");
            return;
        }

        if (!this.currentPath || 
            Date.now() - this.pathUpdateTimer > 500) {
            
            try {
                let newPath = this.pathfinder.findPath(
                    this.x, 
                    this.y, 
                    player.x, 
                    player.y,
                    this.currentRoom
                );
                
                // If we got a valid path, use it
                if (newPath && newPath.length > 0 && newPath.length < 100) {
                    this.currentPath = newPath;
                    this.lastTargetX = player.x;
                    this.lastTargetY = player.y;
                } else {
                    // Fallback to direct path if no valid path found
                    this.currentPath = [{x: player.x, y: player.y}];
                }
                this.pathUpdateTimer = Date.now();
                
            } catch (error) {
                console.warn("Pathfinding error:", error);
                // Fallback to direct path
                this.currentPath = [{x: player.x, y: player.y}];
            }
        }

        // Follow path - no collision checks during movement
        if (this.currentPath && this.currentPath.length > 0) {
            const target = this.currentPath[0];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If we're close enough to current waypoint, move to next one
            if (distance < 32) {  // One tile width
                this.currentPath.shift();
                return;
            }

            // Move towards target without collision checks
            if (distance > 0) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;

                // Update animation based on primary movement direction
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

    draw(ctx) {
        // Only draw if not hiding
        if (!this.isHiding) {
            // Draw the rat sprite
            this.currentAnimation.drawFrame(
                this.gameController.gameEngine.clockTick,
                ctx,
                (this.x-45) - this.gameController.gameStates.playing.camera.x,
                (this.y-40) - this.gameController.gameStates.playing.camera.y
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

                // Draw state information above rat
                ctx.fillStyle = "cyan";
                ctx.strokeStyle = "black";
                ctx.font = "12px Arial";
                ctx.lineWidth = 2;
                
                const followText = `Chasing: ${this.isChasing ? 'Yes' : 'No'}`;
                const roomText = `Room: ${this.currentRoom || 'None'}`;
                const positionText = `Pos: ${Math.floor(this.x/32)}, ${Math.floor(this.y/32)}`;
                
                const xPos = this.x - this.gameController.gameStates.playing.camera.x;
                const yBase = this.y - this.gameController.gameStates.playing.camera.y - 70;
                const lineHeight = 15;
                
                [followText, roomText, positionText].forEach((text, i) => {
                    const yPos = yBase + (i * lineHeight);
                    ctx.strokeText(text, xPos, yPos);
                    ctx.fillText(text, xPos, yPos);
                });

                // Draw path if it exists
                if (this.currentPath) {
                    ctx.strokeStyle = 'yellow';
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

    // Add methods to control chase behavior
    startChasing() {
        this.isChasing = true;
        console.log("Rat is chasing");
    }

    stopChasing() {
        this.isChasing = false;
        this.currentPath = null;
        console.log("Rat is not chasing");
    }
}