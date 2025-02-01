class MenuState extends GameState {
    constructor(gameController) {
        super(gameController);
        this.removeFromWorld = false;
        
        // Menu options
        this.options = [
            { text: "Play", action: () => this.startGame() },
            { text: "How to Play", action: () => this.showHowToPlay() },
            { text: "About", action: () => this.showAbout() }
        ];
        
        this.selectedOption = 0;
        
        // Load the custom font
        ASSET_MANAGER.queueDownload("./assets/fonts/I Still Know.ttf");
    }

    update() {
        // Handle menu navigation
        if (this.gameController.gameEngine.consumeKeyPress("ArrowUp") || 
            this.gameController.gameEngine.consumeKeyPress("w")) {
            this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
        }
        if (this.gameController.gameEngine.consumeKeyPress("ArrowDown") || 
            this.gameController.gameEngine.consumeKeyPress("s")) {
            this.selectedOption = (this.selectedOption + 1) % this.options.length;
        }
        
        // Handle selection
        if (this.gameController.gameEngine.consumeKeyPress("Enter")) {
            this.options[this.selectedOption].action();
        }
    }

    startGame() {
        this.gameController.gameStates.playing = new PlayingState(this.gameController);
        this.gameController.changeState(this.gameController.gameStates.playing);
        this.gameController.gameStates.playing.initEntities();
        this.gameController.gameEngine.addEntity(this.gameController.gameStates.playing);
        this.removeFromWorld = true;
    }

    showHowToPlay() {
        this.gameController.gameStates.howToPlay = new HowToPlayState(this.gameController);
        this.gameController.gameEngine.addEntity(this.gameController.gameStates.howToPlay);
        this.removeFromWorld = true;

    }

    showAbout() {
        this.gameController.gameStates.about = new AboutState(this.gameController);
        this.gameController.gameEngine.addEntity(this.gameController.gameStates.about);
        this.removeFromWorld = true;
    }


    draw(ctx) {
        // Set background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Set up text properties
        ctx.font = '48px "I Still Know"';
        ctx.textAlign = 'center';
        
        // Draw title
        ctx.fillStyle = 'Red';
        ctx.fillText('Labyrinth of Fear', ctx.canvas.width / 2, 100);
        
        // Draw menu options
        this.options.forEach((option, index) => {
            if (index === this.selectedOption) {
                ctx.fillStyle = 'Red';
                ctx.fillText('> ' + option.text + ' <', ctx.canvas.width / 2, 250 + index * 60);
            } else {
                ctx.fillStyle = 'White';
                ctx.fillText(option.text, ctx.canvas.width / 2, 250 + index * 60);
            }
        });
        
        // Draw instructions
        ctx.font = '24px "I Still Know"';
        ctx.fillStyle = 'Gray';
        ctx.fillText('Use W/S or ↑/↓ to navigate, Enter to select', ctx.canvas.width / 2, ctx.canvas.height - 50);
    }
}

class AboutState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    update() {
        if (this.gameController.gameEngine.consumeKeyPress("Enter")) {
            this.gameController.gameEngine.addEntity(new MenuState(this.gameController));
            this.gameController.changeState(this.gameController.gameStates.menu);
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        // Set background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw title
        ctx.font = '48px "I Still Know"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'Red';
        ctx.fillText('About', ctx.canvas.width / 2, 100);
        
        // Draw about text
        ctx.font = '24px "I Still Know"';
        ctx.fillStyle = 'White';
        ctx.fillText('A group of friends break into an abandoned mansion,', ctx.canvas.width / 2, 200);
        ctx.fillText('seeking valuable items left behind by the mysterious Mr. Harrison.', ctx.canvas.width / 2, 250);
        ctx.fillText('But dark forces lurk within these walls...', ctx.canvas.width / 2, 300);
        ctx.fillText('Created by Jose Rodriguez Winter 2025', ctx.canvas.width / 2, 370);
        ctx.fillText('TCSS 491 -  Game and Simulation Design', ctx.canvas.width / 2, 410);
        
        // Draw return instruction
        ctx.fillStyle = 'Gray';
        ctx.fillText('Press Enter to return to menu', ctx.canvas.width / 2, ctx.canvas.height - 50);
    }
}

class HowToPlayState extends GameState {
    constructor(gameController) {
        super(gameController);
    }

    update() {
        if (this.gameController.gameEngine.consumeKeyPress("Enter")) {
            this.gameController.gameEngine.addEntity(new MenuState(this.gameController));
            this.gameController.changeState(this.gameController.gameStates.menu);
            this.removeFromWorld = true;
        }
    }       

    draw(ctx) {
        // Set background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw title   
        ctx.font = '48px "I Still Know"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'Red';
        ctx.fillText('How to Play', ctx.canvas.width / 2, 100);

        // Draw instructions
        ctx.font = '24px "I Still Know"';
        ctx.fillStyle = 'White';
        ctx.fillText('Use WASD or Arrow Keys to move', ctx.canvas.width / 2, 200);
        ctx.fillText('Press E to interact with objects and items', ctx.canvas.width / 2, 250);
        ctx.fillText('Search the mansion for clues and items', ctx.canvas.width / 2, 300);
        ctx.fillText('Find a way to survive the night...', ctx.canvas.width / 2, 350);
        ctx.fillText('And discover the truth about Mr. Harrison', ctx.canvas.width / 2, 400);
        
        // Draw return instruction
        ctx.fillStyle = 'Gray';
        ctx.fillText('Press Enter to return to menu', ctx.canvas.width / 2, ctx.canvas.height - 50);
    }
}
