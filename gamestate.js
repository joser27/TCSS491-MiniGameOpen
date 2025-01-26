class GameState {
    constructor(gameController) {
        this.gameController = gameController;
    }

    update() {
        // Override in child classes
    }

    draw(ctx) {
        // Override in child classes
    }

    enter() {
        // Called when entering this state
    }

    exit() {
        // Called when exiting this state
    }
}