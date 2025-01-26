class InventoryState extends GameState {
    constructor(gameController, previousState) {
        super(gameController);
        this.previousState = previousState;
        this.selectedIndex = 0;
        this.player = previousState.player;
        this.camera = previousState.camera;
        this.removeFromWorld = false;
    }

    update() {
        
        if (this.gameController.gameEngine.consumeKeyPress('i')) {
            console.log("inventory closed")
            this.player.isPaused = false;
            this.previousState.isPaused = false;
            this.gameController.changeState(this.previousState);
            this.removeFromWorld = true;
            this.gameController.gameStates.inventory = null;
        }

        if (this.gameController.gameEngine.consumeKeyPress('w')) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        }

        if (this.gameController.gameEngine.consumeKeyPress('s')) {
            const inventory = this.player.getInventory();
            this.selectedIndex = Math.min(inventory.length - 1, this.selectedIndex + 1);
        }
    }

    draw(ctx) {
        this.gameController.gameState.camera = this.camera;
        
        this.previousState.draw(ctx);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw inventory UI
        const inventory = this.player.getInventory();
        
        // Draw inventory box
        ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        const boxWidth = 400;
        const boxHeight = 300;
        const boxX = (ctx.canvas.width - boxWidth) / 2;
        const boxY = (ctx.canvas.height - boxHeight) / 2;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw title
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Inventory', ctx.canvas.width / 2, boxY + 40);

        // Draw items
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        if (inventory.length === 0) {
            ctx.fillText('No items', boxX + 20, boxY + 80);
        } else {
            // Draw items list
            inventory.forEach((item, index) => {
                const y = boxY + 80 + (index * 30);
                // Highlight selected item
                if (index === this.selectedIndex) {
                    ctx.fillStyle = 'yellow';
                    ctx.fillText('> ', boxX + 20, y);
                }
                ctx.fillStyle = 'white';
                ctx.fillText(item, boxX + 40, y);
            });

            // Draw description box for selected item
            if (inventory[this.selectedIndex]) {
                const selectedItem = inventory[this.selectedIndex];
                const itemData = GAME_ITEMS_DATA[selectedItem];
                
                if (itemData && itemData.description) {
                    // Draw description box
                    ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
                    const descBoxX = boxX + boxWidth + 20;
                    const descBoxY = boxY;
                    const descBoxWidth = 300;
                    const descBoxHeight = 150;
                    
                    ctx.fillRect(descBoxX, descBoxY, descBoxWidth, descBoxHeight);
                    ctx.strokeStyle = 'white';
                    ctx.strokeRect(descBoxX, descBoxY, descBoxWidth, descBoxHeight);

                    // Draw description text
                    ctx.fillStyle = 'white';
                    ctx.font = '16px Arial';
                    
                    // Word wrap the description
                    const words = itemData.description.split(' ');
                    let line = '';
                    let y = descBoxY + 30;
                    const maxWidth = descBoxWidth - 20;
                    
                    words.forEach(word => {
                        const testLine = line + word + ' ';
                        const metrics = ctx.measureText(testLine);
                        
                        if (metrics.width > maxWidth) {
                            ctx.fillText(line, descBoxX + 10, y);
                            line = word + ' ';
                            y += 25;
                        } else {
                            line = testLine;
                        }
                    });
                    ctx.fillText(line, descBoxX + 10, y);
                }
            }
        }

        // Draw controls help
        ctx.font = '16px Arial';
        ctx.fillText('W/S - Navigate    I - Close', boxX + 20, boxY + boxHeight - 20);
    }
}