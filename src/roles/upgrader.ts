export class Upgrader {
    public static run(creep: Creep): void {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
        } else if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller!, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else {
            // Withdraw energy from storage or containers
            let source: any = creep.room.storage;

            if (!source || source.store[RESOURCE_ENERGY] === 0) {
                source = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
                    filter: (structure) =>
                        structure.structureType === STRUCTURE_CONTAINER &&
                        (structure as StructureContainer).store[RESOURCE_ENERGY] > 0,
                });
            }

            if (source) {
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                // Fallback to harvesting from sources
                const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (source) {
                    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        }
    }
}
