// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};
        this.keysPressed = {};

        // Options and the Details
        this.options = options || {
            debugging: false,
        };

    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("keydown", event => {
            if (!this.keys[event.key]) {
                this.keysPressed[event.key] = true;
            }
            this.keys[event.key] = true;
        });

        this.ctx.canvas.addEventListener("keyup", event => {
            this.keys[event.key] = false;
            this.keysPressed[event.key] = false;
        });
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        let sortedEntities = [...this.entities].sort((a, b) => {
            // Get base layer from z-index (default to 0 if not set)
            const aZ = a.zIndex || 0;
            const bZ = b.zIndex || 0;
            
            // If z-indices are different, use that
            if (aZ !== bZ) {
                return aZ - bZ;
            }
            
            // If same z-index, sort by y-position
            const aY = a.boundingBox ? a.boundingBox.y : (a.y || 0);
            const bY = b.boundingBox ? b.boundingBox.y : (b.y || 0);
            return aY - bY;
        });

        // Draw all entities in sorted order
        for (let entity of sortedEntities) {
            entity.draw(this.ctx, this);
        }
        
        this.drawFPS(this.ctx);
    };

    drawFPS(ctx) {
        const debugCheckbox = document.getElementById('debug');
        if (debugCheckbox.checked) {
            this.ctx.fillStyle = "white";
            this.ctx.strokeStyle = "black";
            this.ctx.font = "bold 16px Arial";
            this.ctx.lineWidth = 4;

            this.ctx.strokeText("FPS: " + this.timer.fps, 10, 30);
            this.ctx.fillText("FPS: " + this.timer.fps, 10, 30);
        }

    }

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                if (!entity.isPaused) {
                    entity.update();
                }
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

    consumeKeyPress(key) {
        const wasPressed = this.keysPressed[key];
        this.keysPressed[key] = false;
        return wasPressed;
    }

};

// KV Le was here :)