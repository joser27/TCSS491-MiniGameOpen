class StoryManager {
    constructor(gameController, player, camera) {
        this.gameController = gameController;
        this.player = player;
        this.camera = camera;
        this.flags = {
            hasSeenFirstRat: false,
            hasFinishedIntro: false,
            hasFoundKey: false,
            hasUnlockedBasement: false,
            hasSplitUp: false,
            hasFinishedSearching: false,
        };
        this.currentEvent = null;
        this.isInCutscene = false;
        this.fadeLevel = 0;
        this.hasFixedZIndex = true;
        this.zIndex = 1000;
    }

    update() {


        if (this.currentEvent) {
            this.currentEvent.update();
        }
    }

    draw(ctx) {
        if (this.currentEvent) {
            this.currentEvent.draw(ctx);
        }

        if (this.fadeLevel > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeLevel})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    triggerEvent(eventName) {
        switch(eventName) {
            case 'firstRatEncounter':
                this.isInCutscene = true;  // Set when cutscene starts
                this.player.isPaused = true;
                this.currentEvent = new CutsceneEvent(
                    this.gameController,
                    ["What was that?!", "Is that... a rat?"],
                    () => {
                        this.player.isPaused = false;
                    }
                );
                this.flags.hasSeenFirstRat = true;
                break;
            case 'gameIntro':
                this.isInCutscene = true;  // Set when cutscene starts
                this.player.isPaused = true;

                const player = this.player;
                const camera = this.camera;
                camera.x = player.x-600;
                camera.y = player.y-500;


                // Move camera
                const moveCamInterval = setInterval(() => {
                    camera.y -= 1;
                }, 16);

                // After 5 seconds, fade out, reposition, and fade in
                setTimeout(() => {
                    clearInterval(moveCamInterval);
                    
                    // Fade out
                    let opacity = 0;
                    const fadeOut = setInterval(() => {
                        opacity += 0.05;
                        this.fadeLevel = opacity;
                        if (opacity >= 1) {
                            clearInterval(fadeOut);
                            
                            // Reposition camera
                            camera.x = player.x-600;
                            camera.y = player.y-500;
                            
                            // Fade back in
                            const fadeIn = setInterval(() => {
                                opacity -= 0.05;
                                this.fadeLevel = opacity;
                                if (opacity <= 0) {
                                    clearInterval(fadeIn);
                                    this.fadeLevel = 0;
                                    
                                    // Start dialogue after fade
                                    this.currentEvent = new CutsceneEvent(
                                        this.gameController,
                                        [
                                            "Alex: This is such a strange place...",
                                            "Jake: Chill out, man. It's just some old mansion.",
                                            "Lily: I heard the billionaire who lived here, Mr. Harrison, disappeared while doing some weird experiments.",
                                            "Jake: Yeah, trying to make himself younger or something. Rich people are crazy.",
                                            "Mike: Who cares? Place has been empty for months. Easy pickings.",
                                            "Alex: My grandma warned me about this place. She said Mr. Harrison was messing with dark forces...",
                                            "Jake: Your grandma believes in ghost stories, dude.",
                                            "Lily: Still... it's creepy how he just vanished.",
                                            "Mike: Focus, guys. We're here to grab whatever valuables we can before they sell the place.",
                                            "Alex: I've got a bad feeling about this...",
                                            "Jake: You always do, Alex. Let's split up and cover more ground."
                                        ],
                                        () => {
                                            this.player.isPaused = false;
                                            console.log("player is unpaused")
                                        }
                                    );
                                }
                            }, 50);
                        }
                    }, 50);
                }, 6000);

                this.flags.hasFinishedIntro = true;
                break;
            case 'splitUpSequence':
                this.isInCutscene = true;
                this.player.isPaused = true;

                // Start with black screen
                this.fadeLevel = 1;

                // Jake's position
                this.gameController.gameStates.playing.jake.x = 166 * params.tileSize * params.scale;
                this.gameController.gameStates.playing.jake.y = 25 * params.tileSize * params.scale;
                this.gameController.gameStates.playing.jake.currentAnimation = this.gameController.gameStates.playing.jake.animations.idleLeft;

                // Mike's position
                this.gameController.gameStates.playing.mike.x = 162 * params.tileSize * params.scale;
                this.gameController.gameStates.playing.mike.y = 25 * params.tileSize * params.scale;

                // Lily's position
                this.gameController.gameStates.playing.lily.x = 160 * params.tileSize * params.scale;
                this.gameController.gameStates.playing.lily.y = 26 * params.tileSize * params.scale;
                this.gameController.gameStates.playing.lily.currentAnimation = this.gameController.gameStates.playing.lily.animations.idleRight;
                
                // Fade in from black
                const splitUpFadeIn = setInterval(() => {
                    this.fadeLevel -= 0.05;
                    if (this.fadeLevel <= 0) {
                        clearInterval(splitUpFadeIn);
                        this.fadeLevel = 0;
                        
                        // Start dialogue after fade
                        this.currentEvent = new CutsceneEvent(
                            this.gameController,
                            [
                                "Jake: Alright, everyone split up and check different rooms. Meet back here in 10 minutes.",
                                "Lily: I... I guess that makes sense...",
                                "Alex: This is a bad idea!",
                                "Mike: Relax, we'll be fine."
                            ],
                            () => {
                                this.player.isPaused = false;
                                this.triggerEvent('searching');
                            }
                        );
                    }
                }, 60);
                
                this.flags.hasSplitUp = true;
                break;

            case 'searching':
                this.isInCutscene = true;
                this.fadeLevel = 1;

                // Mike's position
                this.gameController.gameStates.playing.mike.x = 1 * params.tileSize * params.scale;
                this.gameController.gameStates.playing.mike.y = 100* params.tileSize * params.scale;

                // Lily's position
                this.gameController.gameStates.playing.lily.x = 1 * params.tileSize * params.scale;
                this.gameController.gameStates.playing.lily.y = 100 * params.tileSize * params.scale;

                this.gameController.gameStates.playing.jake.currentRoom = "foyer_floor1";

                // Fade in from black
                const searchingFadeIn = setInterval(() => {
                    this.fadeLevel -= 0.05;
                    if (this.fadeLevel <= 0) {
                        clearInterval(searchingFadeIn);
                        this.fadeLevel = 0;
                        
                        // Start dialogue after fade
                        this.currentEvent = new CutsceneEvent(
                            this.gameController,
                            [
                                "Alex: Mike, I really don't think we should be here...",
                                "Mike: Just keep looking for valuables, will you?"
                            ],
                            () => {
                                this.gameController.gameStates.playing.jake.followPlayer(this.player);
                                this.gameController.gameStates.playing.jake.startFollowing();
                            }
                        );
                    }
                }, 60);
                this.flags.hasFinishedSearching = true;
                break;
        }
    }
}

class CutsceneEvent {
    constructor(gameController, dialogueLines, onComplete) {
        this.gameController = gameController;
        this.dialogueLines = dialogueLines;
        this.currentLine = 0;
        this.wasSpacePressed = false;
        this.onComplete = onComplete;  // Store the callback
        this.hasFixedZIndex = true;
        this.zIndex = 5000;
    }

    update() {
        if (this.gameController.gameEngine.keys[" "]) {
            if (!this.wasSpacePressed) {
                this.currentLine++;
                if (this.currentLine >= this.dialogueLines.length) {
                    this.gameController.gameStates.playing.storyManager.currentEvent = null;
                    if (this.onComplete) {
                        setTimeout(() => {
                            this.onComplete();
                        }, 200);
                    }
                    this.gameController.gameStates.playing.storyManager.isInCutscene = false;
                }
            }
            this.wasSpacePressed = true;
        } else {
            this.wasSpacePressed = false;
        }
    }

    draw(ctx) {
        if (this.currentLine < this.dialogueLines.length) {
            // Draw semi-transparent black background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(50, 350, 900, 150); 

            // Reset text alignment for dialog
            ctx.textAlign = 'left';
            
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial'; 
            
            // Split long lines
            const line = this.dialogueLines[this.currentLine];
            const words = line.split(' ');
            let currentLine = '';
            let y = 390;  // Starting y position

            // Word wrap
            words.forEach(word => {
                const testLine = currentLine + word + ' ';
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > 850) {  
                    ctx.fillText(currentLine, 70, y);
                    currentLine = word + ' ';
                    y += 30;  // Line spacing
                } else {
                    currentLine = testLine;
                }
            });
            ctx.fillText(currentLine, 70, y); 
            ctx.font = '20px Arial';
            ctx.fillText('Press SPACE to continue...', 70, 470);
        }
    }
}
