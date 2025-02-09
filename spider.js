class Spider extends Agent {
    constructor(gameController, x, y, width, height) {
        super(gameController, x, y, width, height);
        this.speed = 3; // Slightly faster
        
        const SPIDER_SPRITE = {
            SHEET: {
                WIDTH: 240,    
                HEIGHT: 256,   
                COLUMNS: 3,    
                ROWS: 4        
            },
            SIZE: {
                WIDTH: 240 / 3,   
                HEIGHT: 256 / 4   
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
                FRAMES: 3     
            }
        };
        const TRANSFORM_SPRITE = {
            SHEET: {
                WIDTH: 240,    
                HEIGHT: 384,   
                COLUMNS: 1,    
                ROWS: 4        
            },
            SIZE: {
                WIDTH: 240 / 1,   
                HEIGHT: 256 / 4   
            },
            SCALE: 2,
            FRAME_DURATION: 0.2,
            ANIMATION: {
                FRAMES: 3     
            }
        };
        
        this.animations = {
            walkRight: new Animator(
                ASSET_MANAGER.getAsset("./assets/images/monster-spider.png"), 
                0,                                              
                SPIDER_SPRITE.SIZE.HEIGHT * SPIDER_SPRITE.ANIMATION.ROWS.RIGHT,  
                SPIDER_SPRITE.SIZE.WIDTH, 
                SPIDER_SPRITE.SIZE.HEIGHT,
                SPIDER_SPRITE.ANIMATION.FRAMES,
                SPIDER_SPRITE.FRAME_DURATION,
                SPIDER_SPRITE.SCALE
            ),
            walkLeft: new Animator(
                ASSET_MANAGER.getAsset("./assets/images/monster-spider.png"), 
                0,
                SPIDER_SPRITE.SIZE.HEIGHT * SPIDER_SPRITE.ANIMATION.ROWS.LEFT,
                SPIDER_SPRITE.SIZE.WIDTH,
                SPIDER_SPRITE.SIZE.HEIGHT,
                SPIDER_SPRITE.ANIMATION.FRAMES,
                SPIDER_SPRITE.FRAME_DURATION,
                SPIDER_SPRITE.SCALE
            ),
            walkUp: new Animator(
                ASSET_MANAGER.getAsset("./assets/images/monster-spider.png"), 
                0,
                SPIDER_SPRITE.SIZE.HEIGHT * SPIDER_SPRITE.ANIMATION.ROWS.UP,
                SPIDER_SPRITE.SIZE.WIDTH,
                SPIDER_SPRITE.SIZE.HEIGHT,
                SPIDER_SPRITE.ANIMATION.FRAMES,
                SPIDER_SPRITE.FRAME_DURATION,
                SPIDER_SPRITE.SCALE
            ),
            walkDown: new Animator(
                ASSET_MANAGER.getAsset("./assets/images/monster-spider.png"), 
                0,
                SPIDER_SPRITE.SIZE.HEIGHT * SPIDER_SPRITE.ANIMATION.ROWS.DOWN,
                SPIDER_SPRITE.SIZE.WIDTH,
                SPIDER_SPRITE.SIZE.HEIGHT,
                SPIDER_SPRITE.ANIMATION.FRAMES,
                SPIDER_SPRITE.FRAME_DURATION,
                SPIDER_SPRITE.SCALE
            ),
            // transform: new Animator(
            //     ASSET_MANAGER.getAsset("./assets/images/monster-spider-behavior-male.png"), 
            //     0,
            //     TRANSFORM_SPRITE.SIZE.HEIGHT * TRANSFORM_SPRITE.ANIMATION.ROWS.TRANSFORM,
            //     TRANSFORM_SPRITE.SIZE.WIDTH,
            //     TRANSFORM_SPRITE.SIZE.HEIGHT,
            //     TRANSFORM_SPRITE.ANIMATION.FRAMES,
            //     TRANSFORM_SPRITE.FRAME_DURATION,
            //     TRANSFORM_SPRITE.SCALE
            // )
        };
        

        this.currentAnimation = this.animations.walkDown;
        this.facing = 'down';
        
        // Smaller bounding box for spider
        this.boundingBox = new BoundingBox(x, y, width * 2, height);
        
        // Room-based behavior
        this.currentRoom = null;
        this.isHiding = false;

        this.spawnDelay = 800; // Slightly faster spawn than rat
        this.spawnTimer = 0;  
        this.isSpawning = false; 

        this.pathfinder = null;
        this.currentPath = null;
        this.pathUpdateTimer = 0;
        this.pathUpdateInterval = 400; // More frequent path updates

        this.lastTargetX = 0;
        this.lastTargetY = 0;
        this.isChasing = false;
        this.lastPlayerPos = { x: 0, y: 0 };
        this.pathfindingDelay = false;

        this.zIndex = 200;  
        this.hasFixedZIndex = true; 
    }

    update() {
        if (this.currentRoom === this.gameController.gameStates.playing.worldManager.getCurrentRoom(this.gameController.gameStates.playing.player)) {
            this.startChasing();

        }
        try {
            if (!this.pathfinder && this.gameController.gameStates.playing) {
                this.pathfinder = new AStar(this.gameController.gameStates.playing.worldManager, false);
            }

            const player = this.gameController.gameStates.playing.player;
            if (!player) return;

            if (this.isChasing) {
                const playerRoom = this.gameController.gameStates.playing.worldManager.getCurrentRoom(player);

                const playerMovedFar = Math.abs(this.lastPlayerPos.x - player.x) > 100 || 
                                     Math.abs(this.lastPlayerPos.y - player.y) > 100;

                if (playerMovedFar) {
                    this.pathfindingDelay = true;
                    this.currentPath = null;
                    setTimeout(() => {
                        this.pathfindingDelay = false;
                    }, 500);
                }

                this.lastPlayerPos = { x: player.x, y: player.y };

                if (this.currentRoom !== playerRoom) {
                    this.handleRoomTransition(playerRoom);
                }
            }

            if (this.isSpawning && Date.now() - this.spawnTimer >= this.spawnDelay) {
                this.isSpawning = false;
                this.isHiding = false;
            }

            if (!this.isHiding && !this.isSpawning && 
                this.currentRoom === this.gameController.gameStates.playing.worldManager.getCurrentRoom(player) && 
                this.isChasing && !this.pathfindingDelay) {
                this.chasePlayer(player);
            }

            this.boundingBox.update(this.x, this.y+50);

        } catch (error) {
            console.error("Spider update error:", error);
            this.isChasing = false;
        }
    }

    handleRoomTransition(newPlayerRoom) {
        if (!this.isChasing) return;

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
            this.x = nearestDoor.x;
            this.y = nearestDoor.y;
            this.currentRoom = newPlayerRoom;
            this.isSpawning = true;
            this.spawnTimer = Date.now();
            this.isHiding = true;
            this.currentPath = null;
        }
    }

    chasePlayer(player) {
        if (!this.isChasing || !this.pathfinder) return;

        if (!this.currentPath || Date.now() - this.pathUpdateTimer > this.pathUpdateInterval) {
            try {
                let newPath = this.pathfinder.findPath(
                    this.x, 
                    this.y, 
                    player.x, 
                    player.y,
                    this.currentRoom
                );
                
                if (newPath && newPath.length > 0 && newPath.length < 100) {
                    this.currentPath = newPath;
                    this.lastTargetX = player.x;
                    this.lastTargetY = player.y;
                } else {
                    this.currentPath = [{x: player.x, y: player.y}];
                }
                this.pathUpdateTimer = Date.now();
                
            } catch (error) {
                console.warn("Spider pathfinding error:", error);
                this.currentPath = [{x: player.x, y: player.y}];
            }
        }

        if (this.currentPath && this.currentPath.length > 0) {
            const target = this.currentPath[0];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 32) {
                this.currentPath.shift();
                return;
            }

            if (distance > 0) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;

                // Update animation based on movement
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.currentAnimation = dx > 0 ? this.animations.walkRight : this.animations.walkLeft;
                    this.facing = dx > 0 ? 'right' : 'left';
                } else {
                    this.currentAnimation = dy > 0 ? this.animations.walkDown : this.animations.walkUp;
                    this.facing = dy > 0 ? 'down' : 'up';
                }
            }
        }
    }

    draw(ctx) {
        if (!this.isHiding) {
            this.currentAnimation.drawFrame(
                this.gameController.gameEngine.clockTick,
                ctx,
                (this.x-45) - this.gameController.gameStates.playing.camera.x,
                (this.y-40) - this.gameController.gameStates.playing.camera.y
            );
            
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

                // Draw debug info
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

                // Draw path
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

    startChasing() {
        this.isChasing = true;
        console.log("Spider is chasing");
    }

    stopChasing() {
        this.isChasing = false;
        this.currentPath = null;
        console.log("Spider is not chasing");
    }
}
