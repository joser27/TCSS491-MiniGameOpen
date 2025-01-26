class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.g = 0;  // Cost from start to this node
        this.h = 0;  // Estimated cost from this node to end
        this.f = 0;  // Total cost (g + h)
        this.parent = null;
    }
}

class AStar {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.maxNodes = 1000; // Limit maximum nodes to explore
        this.gridSize = 32 * params.scale; // Use tile size for grid
    }

    findPath(startX, startY, endX, endY, currentRoom) {
        // Convert coordinates to grid positions to reduce search space
        const start = {
            x: Math.floor(startX / this.gridSize),
            y: Math.floor(startY / this.gridSize)
        };
        const end = {
            x: Math.floor(endX / this.gridSize),
            y: Math.floor(endY / this.gridSize)
        };

        // Early exit if start and end are the same
        if (start.x === end.x && start.y === end.y) {
            return [];
        }

        const openSet = new Set();
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        const startKey = `${start.x},${start.y}`;
        openSet.add(startKey);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(start, end));

        let nodesExplored = 0;

        while (openSet.size > 0) {
            // Check node limit
            if (nodesExplored >= this.maxNodes) {
                console.warn("A* reached maximum nodes limit");
                // Return direct path as fallback
                return [{x: endX, y: endY}];
            }
            nodesExplored++;

            // Get node with lowest fScore
            let current = null;
            let lowestF = Infinity;
            for (const key of openSet) {
                const f = fScore.get(key);
                if (f < lowestF) {
                    lowestF = f;
                    current = key;
                }
            }

            const [currentX, currentY] = current.split(',').map(Number);
            
            // Check if we reached the end
            if (currentX === end.x && currentY === end.y) {
                return this.reconstructPath(cameFrom, current, this.gridSize);
            }

            openSet.delete(current);
            closedSet.add(current);

            // Check neighbors (8 directions)
            const neighbors = this.getNeighbors(currentX, currentY, currentRoom);
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (closedSet.has(neighborKey)) continue;

                const tentativeG = gScore.get(current) + 1;

                if (!openSet.has(neighborKey)) {
                    openSet.add(neighborKey);
                } else if (tentativeG >= gScore.get(neighborKey)) {
                    continue;
                }

                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + this.heuristic(neighbor, end));
            }
        }

        // No path found, return direct path as fallback
        console.warn("No path found");
        return [{x: endX, y: endY}];
    }

    getNeighbors(x, y, currentRoom) {
        const neighbors = [];
        const directions = [
            {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1},
            {x: -1, y: -1}, {x: -1, y: 1}, {x: 1, y: -1}, {x: 1, y: 1}
        ];

        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;

            // Convert back to world coordinates for collision check
            const worldX = newX * this.gridSize;
            const worldY = newY * this.gridSize;

            // Create a small bounding box for collision check
            const testBox = new BoundingBox(
                worldX,
                worldY,
                this.gridSize / 2,
                this.gridSize / 2
            );

            // Only add neighbor if it's not colliding with a wall
            if (!this.worldManager.isCollidingWithWall(testBox)) {
                neighbors.push({x: newX, y: newY});
            }
        }

        return neighbors;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    reconstructPath(cameFrom, current, gridSize) {
        const path = [];
        while (cameFrom.has(current)) {
            const [x, y] = current.split(',').map(Number);
            path.unshift({
                x: x * gridSize + gridSize / 2,
                y: y * gridSize + gridSize / 2
            });
            current = cameFrom.get(current);
        }
        return path;
    }

    isPathClear(start, end) {
        // Check a few points along the direct path
        const steps = 3; // Reduced number of checks
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const checkX = start.x + (end.x - start.x) * t;
            const checkY = start.y + (end.y - start.y) * t;
            
            const testBox = new BoundingBox(
                checkX,
                checkY,
                this.gridSize / 2,
                this.gridSize / 2
            );

            if (this.worldManager.isCollidingWithWall(testBox)) {
                return false;
            }
        }
        return true;
    }
}
