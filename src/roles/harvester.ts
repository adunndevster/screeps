export class Harvester {
    public static run(creep: Creep): void {
        // Check if creep is harvesting or needs to deposit energy
        if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
            creep.memory.harvesting = false;
        } else if (!creep.memory.harvesting && creep.store.getUsedCapacity() === 0) {
            creep.memory.harvesting = true;
        }

        if (creep.memory.harvesting) {
            // Find the nearest source
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        } else {
            // Transfer energy to storage or container
            let target:any = creep.room.storage;
            if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                target = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
                    filter: (structure) =>
                        structure.structureType === STRUCTURE_CONTAINER &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
                });
            }

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
    }
}
