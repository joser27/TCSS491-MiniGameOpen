class InspectableItem {
    constructor(gameController, x, y, width, height, interactionCallback) {
        this.gameController = gameController;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.highlight = false;
        this.interactionCallback = interactionCallback;
        this.showingDialog = false;
        this.dialogText = "";
        this.interactionCooldown = false;
        
        // Create bounding box for interaction detection
        this.boundingBox = new BoundingBox(x, y, width, height);
        // Create a larger bounding box for detecting player proximity
        this.interactionBox = new BoundingBox(
            x - 20,  // Expand interaction area around item
            y - 20,
            width + 40,
            height + 40
        );
        this.zIndex = 500;
        this.hasFixedZIndex = true;
    }

    interact() {
        if (this.interactionCallback && !this.interactionCooldown) {
            this.interactionCallback();
            
            this.interactionCooldown = true;
            
            const checkKeyUp = () => {
                if (!this.gameController.gameEngine.keys['e']) {
                    this.interactionCooldown = false;
                } else {
                    requestAnimationFrame(checkKeyUp);
                }
            };
            checkKeyUp();
        }
    }

    update() {
        // Update bounding boxes with current position
        this.boundingBox.update(this.x, this.y);
        this.interactionBox.update(this.x - 20, this.y - 20);
    }

    showDialog(text) {
        this.showingDialog = true;
        this.dialogText = text;
    }

    hideDialog() {
        this.showingDialog = false;
        this.dialogText = "";
    }

    draw(ctx) {
        // Draw the base item
        ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
        ctx.fillRect(
            this.x - this.gameController.gameState.camera.x, 
            this.y - this.gameController.gameState.camera.y, 
            this.width, 
            this.height
        );



        // Draw dialog box if showing
        if (this.showingDialog) {
            this.drawDialogBox(ctx);
        }

        // Debug: draw interaction box
        const debugCheckbox = document.getElementById('debug');
        if (debugCheckbox?.checked) {
            // If highlighted, draw additional visual feedback
            if (this.highlight) {
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    this.x - this.gameController.gameState.camera.x,
                    this.y - this.gameController.gameState.camera.y,
                    this.width,
                    this.height
                );
            }
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.interactionBox.x - this.gameController.gameState.camera.x,
                this.interactionBox.y - this.gameController.gameState.camera.y,
                this.interactionBox.width,
                this.interactionBox.height
            );
        }
    }

    drawDialogBox(ctx) {
        // Calculate dialog box position (above the item)
        const padding = 10;
        const boxHeight = 40;
        const boxWidth = ctx.measureText(this.dialogText).width + padding * 2;
        
        const boxX = this.x - this.gameController.gameState.camera.x - (boxWidth - this.width) / 2;
        const boxY = this.y - this.gameController.gameState.camera.y - boxHeight - padding;

        // Draw dialog box background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(
            this.dialogText,
            boxX + padding,
            boxY + boxHeight/2 + 5
        );
    }
}

class InspectableItemManager {
    constructor(gameController) {
        this.gameController = gameController;
        this.items = [];
        this.activeItem = null;
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(item) {
        this.items = this.items.filter(i => i !== item);
    }

    checkInteractions(player) {
        // Check if player is near any items using bounding boxes
        this.items.forEach(item => {
            // Use player's bounding box to check intersection with item's interaction box
            if (player.boundingBox.collide(item.interactionBox)) {
                item.highlight = true;
                // If player presses interaction key (e.g., 'E')
                if (this.gameController.gameEngine.keys['e']) {
                    this.activeItem = item;
                    // Trigger item's interaction
                    item.interact();
                }
            } else {
                item.highlight = false;
            }
        });
    }

    update() {
        this.items.forEach(item => item.update());
    }

    draw(ctx) {
        this.items.forEach(item => {
            item.draw(ctx);
            if (item.highlight) {
                // Draw interaction prompt
                ctx.fillStyle = "white";
                ctx.font = "12px Arial";
                ctx.fillText("Press E to interact", 
                    item.x - this.gameController.gameState.camera.x, 
                    item.y - this.gameController.gameState.camera.y - 10);
            }
        });
    }
}

const GameItems = Object.freeze({
    BASEMENT_KEY: "Basement Key",
    ATTIC_KEY: "Attic Key",
    GARDEN_KEY: "Garden Key",
    RITUAL_BOOK: "Ritual Book",
    RUSTY_KEY: "Rusty Key",
    TALISMAN: "Talisman",
    RITUAL_DAGGER: "Ritual Dagger",
    SECRET_ROOM_KEY: "Secret Room Key"
});

const GAME_ITEMS_DATA = Object.freeze({
    [GameItems.BASEMENT_KEY]: {
        name: GameItems.BASEMENT_KEY,
        description: "A key to the basement. It feels unnaturally cold to the touch."
    },
    [GameItems.ATTIC_KEY]: {
        name: GameItems.ATTIC_KEY,
        description: "A key to the attic"
    },
    [GameItems.RITUAL_BOOK]: {
        name: GameItems.RITUAL_BOOK,
        description: "An ancient tome filled with strange symbols and cryptic riddles. One page mentions a key hidden in the living room."
    },
    [GameItems.RUSTY_KEY]: {
        name: GameItems.RUSTY_KEY,
        description: "An old, rusty key found behind a crooked painting. It might unlock Bedroom 2."
    },
    [GameItems.TALISMAN]: {
        name: GameItems.TALISMAN,
        description: "A mysterious talisman found beneath the bathroom sink. It radiates a strange protective energy."
    },
    [GameItems.RITUAL_DAGGER]: {
        name: GameItems.RITUAL_DAGGER,
        description: "An ornate dagger used in Mr. Harrison's rituals. The blade seems to react to certain symbols."
    },
    [GameItems.SECRET_ROOM_KEY]: {
        name: GameItems.SECRET_ROOM_KEY,
        description: "A peculiar key found in the hidden ritual room. It looks designed for a specific lock."
    }
});
