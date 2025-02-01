class WorldManager {
    constructor(gameController) {
        this.gameController = gameController;
        this.hasFixedZIndex = true;
        
        this.SHEET_PARAMS = {
            A4_Nature_Rasak: {
                frames: { cols: 48, rows: 48 },
                dimension: { width: 768, height: 768 }
            }
        };

        // Define map positions (in grid coordinates)
        this.mapPositions = {
            dining_room: { x: -50, y: 100 },
            bathroom: { x: -150, y: 0 },
            foyer_floor2: { x: 50, y: 0 },
            study: { x: 100, y: 0 },
            foyer_floor1: { x: 150, y: 0 },
            kitchen: { x: 200, y: 0 },
            bedroom2: { x: 300, y: 100 },
            bedroom1: { x: 300, y: 0 },
            outside: { x: 400, y: 0 },
            basement: { x: 500, y: 0 }
        };
        
        this.loadMaps();
        
        // Initialize doors array
        this.doors = [];
        
        // Add doors after loading maps
        this.initializeDoors();

        // Initialize room bounding boxes
        this.roomBoundingBoxes = {
            bathroom: new BoundingBox(
                this.mapPositions.bathroom.x * params.tileSize * params.scale,
                this.mapPositions.bathroom.y * params.tileSize * params.scale,
                32 * params.tileSize * params.scale,  // width in tiles
                32 * params.tileSize * params.scale   // height in tiles
            ),
            foyer_floor2: new BoundingBox(
                this.mapPositions.foyer_floor2.x * params.tileSize * params.scale,
                this.mapPositions.foyer_floor2.y * params.tileSize * params.scale,
                32 * params.tileSize * params.scale,
                32 * params.tileSize * params.scale
            ),
            study: new BoundingBox(
                this.mapPositions.study.x * params.tileSize * params.scale,
                this.mapPositions.study.y * params.tileSize * params.scale,
                32 * params.tileSize * params.scale,
                32 * params.tileSize * params.scale
            ),
            foyer_floor1: new BoundingBox(
                this.mapPositions.foyer_floor1.x * params.tileSize * params.scale,
                this.mapPositions.foyer_floor1.y * params.tileSize * params.scale,
                32 * params.tileSize * params.scale,
                32 * params.tileSize * params.scale
            ),
            kitchen: new BoundingBox(
                this.mapPositions.kitchen.x * params.tileSize * params.scale,
                this.mapPositions.kitchen.y * params.tileSize * params.scale,
                32 * params.tileSize * params.scale,
                32 * params.tileSize * params.scale
            ),
            bedroom2: new BoundingBox(
                this.mapPositions.bedroom2.x * params.tileSize * params.scale,
                this.mapPositions.bedroom2.y * params.tileSize * params.scale,
                64 * params.tileSize * params.scale,
                32 * params.tileSize * params.scale
            ),
            bedroom1: new BoundingBox(
                this.mapPositions.bedroom1.x * params.tileSize * params.scale,
                this.mapPositions.bedroom1.y * params.tileSize * params.scale,
                64 * params.tileSize * params.scale,
                32 * params.tileSize * params.scale
            ),
            outside: new BoundingBox(
                this.mapPositions.outside.x * params.tileSize * params.scale,
                this.mapPositions.outside.y * params.tileSize * params.scale,
                64 * params.tileSize * params.scale,
                64 * params.tileSize * params.scale
            ),
            dining_room: new BoundingBox(
                this.mapPositions.dining_room.x * params.tileSize * params.scale,
                this.mapPositions.dining_room.y * params.tileSize * params.scale,
                96 * params.tileSize * params.scale,
                32 * params.tileSize * params.scale
            ),
            basement: new BoundingBox(
                this.mapPositions.basement.x * params.tileSize * params.scale,
                this.mapPositions.basement.y * params.tileSize * params.scale,
                64 * params.tileSize * params.scale,
                64 * params.tileSize * params.scale
            )
        };

        this.COLLISION_TILE_ID = 1465; // Update if this is different for your tileset
        this.collisionMap = {}; // store collision data for each room
        this.loadCollisionData();

        this.VIEW_DISTANCE = 0; // Only renders maps that are visible on screen

        // Add cache for rendered maps
        this.mapCache = {};
        this.lastCameraPosition = { x: 0, y: 0 };
        
        // Cache invalidation distance (in pixels)
        this.CACHE_INVALIDATION_THRESHOLD = 32;
        
        // Initialize map cache
        this.inspectableItems = new InspectableItemManager(this.gameController);
        this.initializeMapCache();
        this.loadInspectableItems();

        this.chairDown = new ChairDown(this, 159*params.tileSize*params.scale, 17*params.tileSize*params.scale, 32, 32);
        this.gameController.gameEngine.addEntity(this.chairDown);


        this.worldObjects = [this.chairDown];

    }


    loadInspectableItems() {
        // Ritual Book in Study
        const ritualBook = new InspectableItem(
            this.gameController,
            106*params.tileSize*params.scale, 
            10*params.tileSize*params.scale,
            32, 32,
            () => {
                if (this.gameController.gameStates.playing.player.hasItem(GameItems.RITUAL_BOOK)) {
                    ritualBook.showDialog("You've already taken the Ritual Book");
                } else {
                    ritualBook.showDialog("Found " + GameItems.RITUAL_BOOK + ": Strange symbols hint at a key in the living room...");
                    this.gameController.gameStates.playing.player.addToInventory(GameItems.RITUAL_BOOK);
                }
                setTimeout(() => ritualBook.hideDialog(), 3000);
            }
        );
        this.inspectableItems.addItem(ritualBook);

        // Rusty Key behind Living Room painting
        const livingRoomPainting = new InspectableItem(
            this.gameController,
            255*params.tileSize*params.scale, 
            5*params.tileSize*params.scale,
            32, 32,
            () => {
                if (!this.gameController.gameStates.playing.player.hasItem(GameItems.RITUAL_BOOK)) {
                    livingRoomPainting.showDialog("A crooked painting. Something feels off about it...");
                } else if (this.gameController.gameStates.playing.player.hasItem(GameItems.RUSTY_KEY)) {
                    livingRoomPainting.showDialog("You've already found the key behind this painting");
                } else {
                    livingRoomPainting.showDialog("Found " + GameItems.RUSTY_KEY + "! You hear faint scurrying in the shadows...");
                    this.gameController.gameStates.playing.player.addToInventory(GameItems.RUSTY_KEY);
                }
                setTimeout(() => livingRoomPainting.hideDialog(), 3000);
            }
        );
        this.inspectableItems.addItem(livingRoomPainting);

        // Talisman in Bathroom
        const bathroomSink = new InspectableItem(
            this.gameController,
            10*params.tileSize*params.scale, 
            15*params.tileSize*params.scale,
            32, 32,
            () => {
                if (!this.gameController.gameStates.playing.player.hasItem(GameItems.RUSTY_KEY)) {
                    bathroomSink.showDialog("A cracked sink. Nothing interesting yet...");
                } else if (this.gameController.gameStates.playing.player.hasItem(GameItems.TALISMAN)) {
                    bathroomSink.showDialog("The sink where you found the Talisman...");
                } else {
                    bathroomSink.showDialog("Found " + GameItems.TALISMAN + "! The door suddenly slams shut!");
                    this.gameController.gameStates.playing.player.addToInventory(GameItems.TALISMAN);
                    // Trigger Jake's death
                }
                setTimeout(() => bathroomSink.hideDialog(), 3000);
            }
        );
        this.inspectableItems.addItem(bathroomSink);

        // Ritual Dagger in Dining Room
        const diningRoomPainting = new InspectableItem(
            this.gameController,
            -40*params.tileSize*params.scale, 
            5*params.tileSize*params.scale,
            32, 32,
            () => {
                if (!this.gameController.gameStates.playing.player.hasItem(GameItems.TALISMAN)) {
                    diningRoomPainting.showDialog("This painting gives off an ominous aura...");
                } else if (this.gameController.gameStates.playing.player.hasItem(GameItems.RITUAL_DAGGER)) {
                    diningRoomPainting.showDialog("The hiding place of the Ritual Dagger...");
                } else {
                    diningRoomPainting.showDialog("Found " + GameItems.RITUAL_DAGGER + "! A journal nearby mentions basement rituals...");
                    this.gameController.gameStates.playing.player.addToInventory(GameItems.RITUAL_DAGGER);
                }
                setTimeout(() => diningRoomPainting.hideDialog(), 3000);
            }
        );
        this.inspectableItems.addItem(diningRoomPainting);

        // Secret Room Key in Bedroom 2
        const bedroom2Wall = new InspectableItem(
            this.gameController,
            360*params.tileSize*params.scale, 
            15*params.tileSize*params.scale,
            32, 32,
            () => {
                if (!this.gameController.gameStates.playing.player.hasItem(GameItems.RITUAL_DAGGER)) {
                    bedroom2Wall.showDialog("Strange symbols cover this wall section...");
                } else if (this.gameController.gameStates.playing.player.hasItem(GameItems.SECRET_ROOM_KEY)) {
                    bedroom2Wall.showDialog("The sealed section you opened with the Ritual Dagger...");
                } else {
                    bedroom2Wall.showDialog("Found " + GameItems.SECRET_ROOM_KEY + "! The wall symbols glow as you use the Ritual Dagger...");
                    this.gameController.gameStates.playing.player.addToInventory(GameItems.SECRET_ROOM_KEY);
                }
                setTimeout(() => bedroom2Wall.hideDialog(), 3000);
            }
        );
        this.inspectableItems.addItem(bedroom2Wall);

        // Basement Key in Kitchen Freezer
        const kitchenFreezer = new InspectableItem(
            this.gameController,
            210*params.tileSize*params.scale, 
            10*params.tileSize*params.scale,
            32, 32,
            () => {
                if (!this.gameController.gameStates.playing.player.hasItem(GameItems.SECRET_ROOM_KEY)) {
                    kitchenFreezer.showDialog("A locked box sits in the freezer...");
                } else if (this.gameController.gameStates.playing.player.hasItem(GameItems.BASEMENT_KEY)) {
                    kitchenFreezer.showDialog("The freezer hums with an unnatural sound...");
                } else {
                    kitchenFreezer.showDialog("Found " + GameItems.BASEMENT_KEY + "! Whispers echo from nowhere...");
                    this.gameController.gameStates.playing.player.addToInventory(GameItems.BASEMENT_KEY);
                }
                setTimeout(() => kitchenFreezer.hideDialog(), 3000);
            }
        );
        this.inspectableItems.addItem(kitchenFreezer);


        const statue = new InspectableItem(
            this.gameController,
            422*params.tileSize*params.scale, 
            38*params.tileSize*params.scale,
            32, 32,
            () => {
                statue.showDialog("An ancient statue");
                setTimeout(() => statue.hideDialog(), 3000);
            }
        );
        this.inspectableItems.addItem(statue);

        this.gameController.gameEngine.addEntity(this.inspectableItems);
    }

    loadMaps() {
        // Load all maps
        this.maps = {
            outside: ASSET_MANAGER.getAsset("./assets/tmj/outside2.tmj"),
            foyer_floor1: ASSET_MANAGER.getAsset("./assets/tmj/foyer_floor1.tmj"),
            bathroom: ASSET_MANAGER.getAsset("./assets/tmj/bathroom.tmj"),
            foyer_floor2: ASSET_MANAGER.getAsset("./assets/tmj/foyer_floor2.tmj"),
            study: ASSET_MANAGER.getAsset("./assets/tmj/study.tmj"),
            kitchen: ASSET_MANAGER.getAsset("./assets/tmj/kitchen.tmj"),
            bedroom2: ASSET_MANAGER.getAsset("./assets/tmj/bedroom2.tmj"),
            bedroom1: ASSET_MANAGER.getAsset("./assets/tmj/bedroom1.tmj"),
            dining_room: ASSET_MANAGER.getAsset("./assets/tmj/dining_room.tmj"),
            basement: ASSET_MANAGER.getAsset("./assets/tmj/basement.tmj"),
        };
        
        // Define tilesets
        this.tilesets = {
            'pixellands': {
                image: ASSET_MANAGER.getAsset("./assets/images/pixellands.png"),
                firstgid: 1,
                tileWidth: 32,
                tileHeight: 32,
                cols: 32
            },
            'Tileset': {
                image: ASSET_MANAGER.getAsset("./assets/images/Tileset.png"),
                firstgid: 1,
                tileWidth: 32,
                tileHeight: 32,
                cols: 20
            }
        };
    }

    initializeDoors() {
        // Door from bathroom to foyer floor 2
        this.doors.push(new Door(
            this.gameController,
            // Door position
            -120 * params.tileSize * params.scale, 
            5 * params.tileSize * params.scale,   
            params.tileSize * params.scale,    // width
            params.tileSize * 2 * params.scale, // height
            // Destination
            52 * params.tileSize * params.scale,  
            4* params.tileSize * params.scale   
        ));

        // Door from foyer floor 2 to bathroom
        this.doors.push(new Door(
            this.gameController,
            // Door position
            50 * params.tileSize * params.scale,
            3 * params.tileSize * params.scale,
            params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            // Destination
            -120 * params.tileSize * params.scale,
            5 * params.tileSize * params.scale
        ));

        // Door from foyer floor 2 to bedroom 2
        this.doors.push(new Door(
            this.gameController,
            // Door position
            60 * params.tileSize * params.scale,
            0 * params.tileSize * params.scale,
            params.tileSize * 2*params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            347 * params.tileSize * params.scale,
            125 * params.tileSize * params.scale
        ));

        // Door from foyer floor 2 to bedroom 1
        this.doors.push(new Door(
            this.gameController,
            // Door position
            75 * params.tileSize * params.scale,
            0 * params.tileSize * params.scale,
            params.tileSize * 2*params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            345 * params.tileSize * params.scale,
            24 * params.tileSize * params.scale,
            false,
            GameItems.RUSTY_KEY
        ));
        // Door from bedroom 1 to foyer floor 2
        this.doors.push(new Door(
            this.gameController,
            // Door position
            344 * params.tileSize * params.scale,
            25 * params.tileSize * params.scale,
            params.tileSize * 2*params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            76 * params.tileSize * params.scale,
            2 * params.tileSize * params.scale
        ));

        // Door from bedroom 2 to foyer floor 2
        this.doors.push(new Door(
            this.gameController,
            // Door position
            346 * params.tileSize * params.scale,
            126 * params.tileSize * params.scale,
            params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            // Destination
            61 * params.tileSize * params.scale,
            2 * params.tileSize * params.scale
        ));

        // Door from foyer floor 2 to foyer floor 1
        this.doors.push(new Door(
            this.gameController,
            // Door position
            53 * params.tileSize * params.scale,
            14 * params.tileSize * params.scale,
            params.tileSize * 5 * params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            155 * params.tileSize * params.scale,
            14 * params.tileSize * params.scale
        ));
        // Door from foyer floor 1 to foyer floor 2
        this.doors.push(new Door(
            this.gameController,
            // Door position
            153 * params.tileSize * params.scale,
            12 * params.tileSize * params.scale,
            params.tileSize * 5 * params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            55 * params.tileSize * params.scale,
            11 * params.tileSize * params.scale
        ));
        // Door from foyer floor 1 to kitchen
        this.doors.push(new Door(
            this.gameController,
            // Door position
            150 * params.tileSize * params.scale,
            22 * params.tileSize * params.scale,
            params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            // Destination
            229 * params.tileSize * params.scale,
            23 * params.tileSize * params.scale
        ));
        // Door from kitchen to foyer floor 1
        this.doors.push(new Door(
            this.gameController,
            // Door position
            230 * params.tileSize * params.scale,
            22 * params.tileSize * params.scale,
            params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            // Destination
            152 * params.tileSize * params.scale,
            23 * params.tileSize * params.scale
        ));
        // Door from kitchen to dining room
        this.doors.push(new Door(
            this.gameController,
            // Door position
            222 * params.tileSize * params.scale,
            1 * params.tileSize * params.scale,
            params.tileSize * 2 *params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            -27 * params.tileSize * params.scale,
            129 * params.tileSize * params.scale
        ));

        // Door from dining room to kitchen
        this.doors.push(new Door(
            this.gameController,
            // Door position
            -28 * params.tileSize * params.scale,
            130 * params.tileSize * params.scale,
            params.tileSize * 2*params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            223 * params.tileSize * params.scale,
            2 * params.tileSize * params.scale,
        ));

        // // Door from dining room to living room
        // this.doors.push(new Door(
        //     this.gameController,
        //     // Door position
        //     -29 * params.tileSize * params.scale,
        //     7 * params.tileSize * params.scale,
        //     params.tileSize * params.scale,
        //     params.tileSize * 2 * params.scale,
        //     // Destination
        //     252 * params.tileSize * params.scale,
        //     7 * params.tileSize * params.scale
        // ));
        // // Door from living room to dining room
        // this.doors.push(new Door(
        //     this.gameController,
        //     // Door position
        //     250 * params.tileSize * params.scale,
        //     7 * params.tileSize * params.scale,
        //     params.tileSize * params.scale,
        //     params.tileSize * 2 * params.scale,
        //     // Destination
        //     -31 * params.tileSize * params.scale,
        //     8 * params.tileSize * params.scale
        // ));
        // Door from living room to study
        this.doors.push(new Door(
            this.gameController,
            // Door position
            18 * params.tileSize * params.scale,
            130 * params.tileSize * params.scale,
            params.tileSize * 2*params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            112 * params.tileSize * params.scale,
            2* params.tileSize * params.scale
        ));          
        // Door from study to living room
        this.doors.push(new Door(
            this.gameController,
            // Door position
            111 * params.tileSize * params.scale,
            1 * params.tileSize * params.scale,
            params.tileSize * 2*params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            19 * params.tileSize * params.scale,
            129 * params.tileSize * params.scale
        ));     
        // Door from study to foyer 1
        this.doors.push(new Door(
            this.gameController,
            // Door position
            100 * params.tileSize * params.scale,
            22 * params.tileSize * params.scale,
            params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            // Destination
            180 * params.tileSize * params.scale,
            23 * params.tileSize * params.scale
        ));    
        // Door from foyer floor 1 to study
        this.doors.push(new Door(
            this.gameController,
            // Door position
            181 * params.tileSize * params.scale,
            22 * params.tileSize * params.scale,
            params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            // Destination
            102 * params.tileSize * params.scale,
            23 * params.tileSize * params.scale
        ));    
        // Outside to foyer floor 1
        this.doors.push(new Door(
            this.gameController,
            // Door position
            430 * params.tileSize * params.scale,
            31 * params.tileSize * params.scale,
            params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            // Destination
            165 * params.tileSize * params.scale,
            27 * params.tileSize * params.scale
        ));
        // Door from foyer floor 2 to nothing
        this.doors.push(new Door(
            this.gameController,
            // Door position
            73 * params.tileSize * params.scale,
            19 * params.tileSize * params.scale,
            params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            // Destination
            72 * params.tileSize * params.scale,
            19 * params.tileSize * params.scale,
            true,
        ));
        // Door from foyer floor 1 to basement
        this.doors.push(new Door(
            this.gameController,
            // Door position
            175 * params.tileSize * params.scale,
            16 * params.tileSize * params.scale,
            params.tileSize *2* params.scale,
            params.tileSize * params.scale,
            // Destination
            556 * params.tileSize * params.scale,
            58 * params.tileSize * params.scale,
            false,
            GameItems.BASEMENT_KEY
        ));
        // Door from basement to foyer 1
        this.doors.push(new Door(
            this.gameController,
            // Door position
            555 * params.tileSize * params.scale,
            59 * params.tileSize * params.scale,
            params.tileSize * 2 * params.scale,
            params.tileSize * 1 * params.scale,
            // Destination
            175 * params.tileSize * params.scale,
            17 * params.tileSize * params.scale
        ));

        
        this.doors.forEach(door => this.gameController.gameEngine.addEntity(door));
    }

    update() {
        // Update all doors
        
        //this.inspectableItems.update();
        this.inspectableItems.checkInteractions(this.gameController.gameStates.playing.player);
    }

    initializeMapCache() {
        // Pre-render each map to its own canvas
        Object.entries(this.maps).forEach(([mapName, mapData]) => {
            const mapCanvas = document.createElement('canvas');
            const mapCtx = mapCanvas.getContext('2d');
            
            // Set canvas size to map dimensions
            mapCanvas.width = mapData.layers[0].width * params.tileSize * params.scale;
            mapCanvas.height = mapData.layers[0].height * params.tileSize * params.scale;
            
            // Render all layers to the canvas
            mapData.layers.forEach(layer => {
                if (layer.type === "objectgroup" || layer.name === "collision") return;
                
                const data = layer.data;
                const width = layer.width;
                
                for (let y = 0; y < layer.height; y++) {
                    for (let x = 0; x < width; x++) {
                        const i = y * width + x;
                        const tileId = data[i];
                        if (tileId === 0) continue;
                        
                        let tileset = this.getTileset(mapName, tileId);
                        const localTileId = tileId - tileset.firstgid;
                        const sourceX = (localTileId % tileset.cols) * tileset.tileWidth;
                        const sourceY = Math.floor(localTileId / tileset.cols) * tileset.tileHeight;
                        
                        mapCtx.drawImage(
                            tileset.image,
                            sourceX, sourceY,
                            tileset.tileWidth, tileset.tileHeight,
                            x * params.tileSize * params.scale,
                            y * params.tileSize * params.scale,
                            params.tileSize * params.scale,
                            params.tileSize * params.scale
                        );
                    }
                }
            });
            
            this.mapCache[mapName] = mapCanvas;
        });
    }

    getTileset(mapName, tileId) {
        // Return appropriate tileset based on map name
        if (mapName === 'outside') {
            return this.tilesets['pixellands'];
        } else if (mapName === 'foyer_floor1') {
            return this.tilesets['Tileset'];
        } else if (mapName === 'bathroom') {
            return this.tilesets['Tileset'];
        }
        // Default fallback
        return this.tilesets['Tileset'];
    }

    draw(ctx) {
        const camera = this.gameController.gameStates.playing.camera;
        const tileScale = params.tileSize * params.scale;
        
        // Calculate visible area plus VIEW_DISTANCE tiles in each direction
        const visibleLeft = camera.x - (this.VIEW_DISTANCE * tileScale);
        const visibleTop = camera.y - (this.VIEW_DISTANCE * tileScale);
        const visibleRight = camera.x + ctx.canvas.width + (this.VIEW_DISTANCE * tileScale);
        const visibleBottom = camera.y + ctx.canvas.height + (this.VIEW_DISTANCE * tileScale);
        
        // Draw visible maps from cache
        Object.entries(this.mapPositions).forEach(([mapName, position]) => {
            const mapCanvas = this.mapCache[mapName];
            const worldX = position.x * tileScale;
            const worldY = position.y * tileScale;
            
            // Skip if map is not within visible area plus VIEW_DISTANCE
            if (worldX + mapCanvas.width < visibleLeft ||
                worldX > visibleRight ||
                worldY + mapCanvas.height < visibleTop ||
                worldY > visibleBottom) {
                return;
            }
            
            // Draw the cached map
            ctx.drawImage(
                mapCanvas,
                0, 0, mapCanvas.width, mapCanvas.height,
                worldX - camera.x,
                worldY - camera.y,
                mapCanvas.width,
                mapCanvas.height
            );
        });
        
        // Update last camera position
        this.lastCameraPosition.x = camera.x;
        this.lastCameraPosition.y = camera.y;
        
        // Draw doors and debug info

        this.drawDebugInfo(ctx);
        //this.inspectableItems.draw(ctx);
    }

    drawDebugInfo(ctx) {
        const debugCheckbox = document.getElementById('debug');
        if (!debugCheckbox.checked) return;
        
        const camera = this.gameController.gameStates.playing.camera;
        
        // Draw room bounding boxes
        Object.entries(this.roomBoundingBoxes).forEach(([roomName, boundingBox]) => {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 4;
            ctx.strokeRect(
                boundingBox.x - camera.x,
                boundingBox.y - camera.y,
                boundingBox.width,
                boundingBox.height
            );
            
            // Draw room name
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.font = '16px Arial';
            ctx.lineWidth = 3;
            ctx.strokeText(roomName,
                boundingBox.x - camera.x + 10,
                boundingBox.y - camera.y + 20
            );
            ctx.fillText(roomName,
                boundingBox.x - camera.x + 10,
                boundingBox.y - camera.y + 20
            );
        });
    }

    getCurrentRoom(player) {
        for (const [roomName, boundingBox] of Object.entries(this.roomBoundingBoxes)) {
            if (boundingBox.collide(player.boundingBox)) {
                return roomName;
            }
        }
        return "Outside";  // player isn't in any room
    }

    loadCollisionData() {
        // Process collision layers for each map
        Object.entries(this.maps).forEach(([roomName, mapData]) => {
            this.collisionMap[roomName] = [];  // Change to array to store BoundingBoxes
            
            // Find the collision layer
            const collisionLayer = mapData.layers.find(layer => layer.name === "collision");
            if (!collisionLayer) return;

            // Store collision tile positions as BoundingBoxes
            const width = collisionLayer.width;
            collisionLayer.data.forEach((tileId, index) => {
                if (tileId === this.COLLISION_TILE_ID) {
                    const x = index % width;
                    const y = Math.floor(index / width);
                    
                    // Create BoundingBox for collision tile
                    const worldX = (x + this.mapPositions[roomName].x) * params.tileSize * params.scale;
                    const worldY = (y + this.mapPositions[roomName].y) * params.tileSize * params.scale;
                    
                    const collisionBox = new BoundingBox(
                        worldX,
                        worldY,
                        params.tileSize * params.scale,
                        params.tileSize * params.scale
                    );

                    // Verify that the BoundingBox is properly constructed
                    if (typeof collisionBox.collide !== 'function') {
                        console.error('Invalid BoundingBox created:', collisionBox);
                        return;
                    }

                    this.collisionMap[roomName].push(collisionBox);
                }
            });
        });
    }

    isCollidingWithWall(boundingBox) {
        // Get current room
        const currentRoom = this.getCurrentRoom(this.gameController.gameStates.playing.player);
        if (currentRoom === "Outside") return false;
        
        // If we received a number instead of a BoundingBox, create a small BoundingBox at that position
        if (typeof boundingBox === 'number') {
            // Create a 1x1 bounding box at the position
            boundingBox = new BoundingBox(
                boundingBox,
                boundingBox,
                1,
                1
            );
        }

        // Verify that we have collision data for the current room
        if (!this.collisionMap[currentRoom] || !Array.isArray(this.collisionMap[currentRoom])) {
            console.warn(`No collision data found for room: ${currentRoom}`);
            return false;
        }

        // Verify that the input boundingBox is valid
        if (!boundingBox || typeof boundingBox.collide !== 'function') {
            console.error('Invalid boundingBox passed to isCollidingWithWall:', boundingBox);
            return false;
        }

        // Check collision against all collision boxes in current room
        return this.collisionMap[currentRoom].some(collisionBox => {
            if (!collisionBox || typeof collisionBox.collide !== 'function') {
                console.error('Invalid collision box found in room:', currentRoom, collisionBox);
                return false;
            }
            return boundingBox.collide(collisionBox);
        });
    }

    addWorldObject(object) {
        this.worldObjects.push(object);
    }
}

