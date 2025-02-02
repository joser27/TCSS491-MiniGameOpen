class WorldObjects {
    constructor(worldManager, x, y, width, height) {
        this.worldManager = worldManager;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zIndex = 200;
        this.camera = this.worldManager.gameController.gameStates.playing.camera;
        this.tileset = ASSET_MANAGER.getAsset('./assets/images/Props.png');
        this.tilesetParams = {
            frames: { cols: 20, rows: 20 },
            dimension: { width: 320, height: 320 }
        };
        this.tiles = []; 
        

        // Default collision
        this.collisionAdjustment = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        this.hasFixedZIndex = true;


        this.updateBoundingBox();
    }

    updateBoundingBox() {
        const tileSize = 32;
        const scale = params.scale;

        const boxWidth = (this.tiles[0]?.length || 1) * tileSize * scale;
        const boxHeight = (this.tiles?.length || 1) * tileSize * scale;

        this.boundingBox = new BoundingBox(
            this.x + (this.collisionAdjustment.x * scale),
            this.y + (this.collisionAdjustment.y * scale),
            boxWidth + (this.collisionAdjustment.width * scale),
            boxHeight + (this.collisionAdjustment.height * scale)
        );
    }

    // Method to set custom collision adjustment
    // - Move collision box x pixels right
    // - Move collision box y pixels down
    // - Shrink width by width pixels
    // - Shrink height by height pixels
    setCollisionAdjustment(x, y, width, height) {
        this.collisionAdjustment = { x, y, width, height };
        this.updateBoundingBox();
    }

    update() {
        this.updateBoundingBox();
    }

    draw(ctx) {
        const tileSize = 32;
        const scale = params.scale;

        const tileWidth = this.tilesetParams.dimension.width / this.tilesetParams.frames.cols;
        const tileHeight = this.tilesetParams.dimension.height / this.tilesetParams.frames.rows;

        // Draw each tile
        for (let row = 0; row < this.tiles.length; row++) {
            for (let col = 0; col < this.tiles[row].length; col++) {
                const tileId = this.tiles[row][col];
                
                // Calculate source position in tileset
                const sourceX = (tileId % this.tilesetParams.frames.cols) * tileWidth;
                const sourceY = Math.floor(tileId / this.tilesetParams.frames.cols) * tileHeight;
                
                // Calculate destination position on canvas
                const destX = this.x + (col * tileSize * scale) - this.camera.x;
                const destY = this.y + (row * tileSize * scale) - this.camera.y;

                // Draw the tile
                ctx.drawImage(
                    this.tileset,
                    sourceX, sourceY,
                    tileWidth, tileHeight,
                    destX, destY-10,
                    tileSize * scale, tileSize * scale
                );
            }
        }

        // Debug: draw bounding box and stats
        const debugCheckbox = document.getElementById('debug');
        if (debugCheckbox.checked) {
            // Draw sprite bounds in blue
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.x - this.camera.x,
                this.y - this.camera.y,
                tileSize * scale * this.tiles[0].length,
                tileSize * scale * this.tiles.length
            );
            
            // Draw collision bounds in red
            ctx.strokeStyle = 'red';
            ctx.strokeRect(
                this.boundingBox.x - this.camera.x,
                this.boundingBox.y - this.camera.y,
                this.boundingBox.width,
                this.boundingBox.height
            );

            // Draw debug stats
            ctx.font = '12px Arial';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            
            const stats = [
                `Z-Index: ${this.zIndex}`,
                `Fixed Z: ${this.hasFixedZIndex}`,
                `X: ${Math.floor(this.x)}`,
                `Y: ${Math.floor(this.y)}`,
                `Collision Adj: ${JSON.stringify(this.collisionAdjustment)}`
            ];

            stats.forEach((stat, index) => {
                const x = this.x - this.camera.x + (tileSize * scale * this.tiles[0].length)/2;
                const y = this.y - this.camera.y - 20 - (index * 15);
                
                // Draw text outline
                ctx.strokeText(stat, x, y);
                // Draw text
                ctx.fillText(stat, x, y);
            });
        }
    }

    // Add method to check if an entity is colliding with this object
    isCollidingWith(boundingBox) {
        if (boundingBox && this.boundingBox) {
            return this.boundingBox.collide(boundingBox);
        }
        return false;
    }
}

class Dresser extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);

    }
}

class Bed extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);

    }
}

class Table extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);

    }
}

class ChairUp extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);
        this.tiles = [

            [171],  
            [191]   
        ];

        this.setCollisionAdjustment(8, 16, -16, -48);
    }
}
class BookOpen extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);
        this.tiles = [
            [106],  
   
        ];


    }
}
class Pot23 extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);
        this.tiles = [
            [23],  
        ];

        
    }
}

class Crate extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);
        this.tiles = [
            [107],
            [127],
        ];

        this.setCollisionAdjustment(10, 5, -16, -38);
    }
}


class Cabinet extends WorldObjects {
    constructor(worldManager, x, y, width, height) {

        super(worldManager, x, y, width, height);
        this.tiles = [
            [8,9,10],
            [28,29,30],
            [48,49,50],

        ];



    }
}

class Desk extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);
        this.tiles = [
            [4358, 4359, 4360],  
            [4374, 4375, 4376],  
            [4390, 4391, 4392]   
        ];

        this.setCollisionAdjustment(4, 32, -8, -40);
    }
}

class Bookcase extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);
        this.tiles = [
            [3927, 3928, 3929, 3930],  
            [3943, 3944, 3945, 3946],  
            [3959, 3960, 3961, 3962],
            [3975, 3976, 3977, 3978],
        ];

        this.setCollisionAdjustment(4, 70, -8, -100);
    }
}

class Lamp extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);
        // Define this.tiles for lamp
    }
}

class openDoor extends WorldObjects {
    constructor(worldManager, x, y, width, height) {
        super(worldManager, x, y, width, height);
        // Define this.tiles for open door
    }
}

