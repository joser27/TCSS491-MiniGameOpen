const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

//TMJ
ASSET_MANAGER.queueDownload("./assets/tmj/outside.tmj");
ASSET_MANAGER.queueDownload("./assets/tmj/foyer_floor1.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/bathroom.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/foyer.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/study.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/foyer_floor1.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/kitchen.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/living_room.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/starting_room.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/bedroom1.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/outside.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/dining_room.tmj");
// ASSET_MANAGER.queueDownload("./assets/tmj/basement.tmj");

//PNG
ASSET_MANAGER.queueDownload("./assets/images/characters2.png");
ASSET_MANAGER.queueDownload("./assets/images/A4_Nature_Rasak.png");
ASSET_MANAGER.queueDownload("./assets/images/Tileset_Building_Rasak.png");
ASSET_MANAGER.queueDownload("./assets/images/Tileset.png");
// ASSET_MANAGER.queueDownload("./assets/art/Interiors_32x32.png");
// ASSET_MANAGER.queueDownload("./assets/art/Room_Builder_32x32.png");
// ASSET_MANAGER.queueDownload("./assets/art/Premade_Character_04.png");
// ASSET_MANAGER.queueDownload("./assets/art/rat.png");
// ASSET_MANAGER.queueDownload("./assets/art/minator.png");
// ASSET_MANAGER.queueDownload("./assets/art/17_Garden_32x32.png");
// ASSET_MANAGER.queueDownload("./assets/art/19_Graveyard_32x32.png");
// ASSET_MANAGER.queueDownload("./assets/art/3_City_Props_32x32.png");
// ASSET_MANAGER.queueDownload("./assets/art/11_Camping_32x32.png");
// ASSET_MANAGER.queueDownload("./assets/art/Premade_Characters20.png");
// ASSET_MANAGER.queueDownload("./assets/art/Premade_Character_12.png");
// ASSET_MANAGER.queueDownload("./assets/art/LILY.png");

//WAV
ASSET_MANAGER.queueDownload("./assets/audio/mixkit-creaky-door-open-195.wav");

//MP3
ASSET_MANAGER.queueDownload("./assets/audio/night-cricket-ambience-22484.mp3");
ASSET_MANAGER.queueDownload("./assets/audio/Locked Door Sound Effect.wav");




ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	
	// Disable image smoothing for crisp pixels
	ctx.imageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;

	// Add fullscreen handler
	document.getElementById('fullscreenButton').addEventListener('click', () => {
		if (canvas.requestFullscreen) {
			canvas.requestFullscreen();
		} else if (canvas.webkitRequestFullscreen) {
			canvas.webkitRequestFullscreen();
		} else if (canvas.msRequestFullscreen) {
			canvas.msRequestFullscreen();
		}
	});

	gameEngine.init(ctx);
	new Controller(gameEngine);
	gameEngine.start();

});
