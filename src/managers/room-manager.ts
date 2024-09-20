import { consUtil } from "utils/console-utility";

export class RoomManager {
    public static run(room: Room, aggressiveness: number): void {
         //buildInfrastructure(room);

        const availableEnergy = room.energyAvailable;
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        consUtil.trackData('availableEnergy', availableEnergy);
        consUtil.trackData('room spawns', room.find(FIND_MY_SPAWNS));

        if (spawn && !spawn.spawning) {
            // Check if we can spawn a claimer based on available energy
            if (availableEnergy >= 650) {
                const claimers = _.filter(Game.creeps, (creep) => creep.memory.role === 'claimer' && creep.room.name === room.name);
                if (claimers.length < 1) {
                    const claimFlag = Game.flags['ClaimFlag'];
                    if (claimFlag) {
                        const body = getCreepBody('claimer', availableEnergy);
                        const result = spawn.spawnCreep(body, 'Claimer' + Game.time, { memory: { role: 'claimer', targetRoom: claimFlag.pos.roomName } });
                        consUtil.trackData('claimer spawn result', result);
                    }
                }
            }

            if (aggressiveness > 50) {
                const warriors = _.filter(Game.creeps, (creep) => creep.memory.role === 'warrior' && creep.room.name === room.name);
                if (warriors.length < 2) {
                    const body = getCreepBody('warrior', availableEnergy);
                    spawn.spawnCreep(body, 'Warrior' + Game.time, { memory: { role: 'warrior' } });
                }
            } else {
                const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.room.name === room.name);
                const carriers = _.filter(Game.creeps, (creep) => creep.memory.role === 'carrier' && creep.room.name === room.name);
                const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader' && creep.room.name === room.name);
                const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder' && creep.room.name === room.name);

                if (harvesters.length < 2) {
                    const body = getCreepBody('harvester', availableEnergy);
                    const result = spawn.spawnCreep(body, 'Harvester' + Game.time, { memory: { role: 'harvester' } });
                } else if (builders.length < 2) {
                    const body = getCreepBody('builder', availableEnergy);
                    spawn.spawnCreep(body, 'Builder' + Game.time, { memory: { role: 'builder' } });
                } else if (carriers.length < 2) {
                    const body = getCreepBody('carrier', availableEnergy);
                    spawn.spawnCreep(body, 'Carrier' + Game.time, { memory: { role: 'carrier' } });
                } else if (upgraders.length < 2) {
                    const body = getCreepBody('upgrader', availableEnergy);
                    spawn.spawnCreep(body, 'Upgrader' + Game.time, { memory: { role: 'upgrader' } });
                }

            }
        }

        const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
        for (const tower of towers) {
            const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            } else {
                const damagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (creep) => creep.hits < creep.hitsMax });
                if (damagedCreep) {
                    tower.heal(damagedCreep);
                } else {
                    const damagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax && structure.structureType !== STRUCTURE_WALL && structure.structureType !== STRUCTURE_RAMPART,
                    });
                    if (damagedStructure) {
                        tower.repair(damagedStructure);
                    }
                }
            }
        }

        const links = room.find<StructureLink>(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
        if (links.length >= 2) {
            const [link1, link2] = links;
            if (link1.store[RESOURCE_ENERGY] > 0) {
                link1.transferEnergy(link2);
            }
        }
    }
}

function getCreepBody(role: string, availableEnergy: number): BodyPartConstant[] {
    const body: BodyPartConstant[] = [];

    if (role === 'harvester' || role === 'carrier' || role === 'upgrader' || role === 'builder') {
        const workParts = Math.min(Math.floor(availableEnergy / 300), 5);
        const carryParts = Math.min(Math.floor(availableEnergy / 300), 5);
        const moveParts = Math.min(Math.floor(availableEnergy / 300), 5);

        for (let i = 0; i < workParts; i++) body.push(WORK);
        for (let i = 0; i < carryParts; i++) body.push(CARRY);
        for (let i = 0; i < moveParts; i++) body.push(MOVE);
    } else if (role === 'warrior') {
        const attackParts = Math.min(Math.floor(availableEnergy / 300), 5);
        const moveParts = Math.min(Math.floor(availableEnergy / 300), 5);

        for (let i = 0; i < attackParts; i++) body.push(ATTACK);
        for (let i = 0; i < moveParts; i++) body.push(MOVE);
    } else if (role === 'claimer') {
        const claimParts = Math.min(Math.floor(availableEnergy / 600), 1);
        const moveParts = Math.min(Math.floor(availableEnergy / 50), 1);

        for (let i = 0; i < claimParts; i++) body.push(CLAIM);
        for (let i = 0; i < moveParts; i++) body.push(MOVE);
    }

    return body;
}

function buildInfrastructure(room: Room): void {
    const extensions = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION },
    });
    if (extensions.length < CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller!.level]) {
        const extensionSites = room.find(FIND_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_EXTENSION },
        });
        if (extensionSites.length < 5) {
            const spawn = room.find(FIND_MY_SPAWNS)[0];
            if (spawn) {
                const positions = getAdjacentPositions(spawn.pos);
                for (const pos of positions) {
                    if (room.createConstructionSite(pos.x, pos.y, STRUCTURE_EXTENSION) === OK) {
                        break;
                    }
                }
            }
        }
    }

    const creeps = room.find(FIND_MY_CREEPS);
    for (const creep of creeps) {
        const roads = creep.pos.lookFor(LOOK_STRUCTURES).filter((s) => s.structureType === STRUCTURE_ROAD);
        const constructionSites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).filter((cs) => cs.structureType === STRUCTURE_ROAD);
        if (roads.length === 0 && constructionSites.length === 0) {
            creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
        }
    }

    const sources = room.find(FIND_SOURCES);
    for (const source of sources) {
        const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
        });
        const constructionSites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
            filter: (cs) => cs.structureType === STRUCTURE_CONTAINER,
        });
        if (containers.length === 0 && constructionSites.length === 0) {
            const positions = getAdjacentPositions(source.pos);
            for (const pos of positions) {
                if (room.createConstructionSite(pos.x, pos.y, STRUCTURE_CONTAINER) === OK) {
                    break;
                }
            }
        }
    }
}

function getAdjacentPositions(pos: RoomPosition): RoomPosition[] {
    const positions: RoomPosition[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const x = pos.x + dx;
            const y = pos.y + dy;
            if (x >= 0 && x < 50 && y >= 0 && y < 50) {
                positions.push(new RoomPosition(x, y, pos.roomName));
            }
        }
    }
    return positions;
}
