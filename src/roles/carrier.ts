export class Carrier {
    public static run(creep: Creep): void {
        // Check if creep is collecting or delivering energy
        if (creep.memory.delivering && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.delivering = false;
        } else if (!creep.memory.delivering && creep.store.getFreeCapacity() === 0) {
            creep.memory.delivering = true;
        }

        if (creep.memory.delivering) {
            // Deliver energy to structures
            let target:any = creep.pos.findClosestByPath<StructureExtension | StructureSpawn | StructureTower>(
                FIND_STRUCTURES,
                {
                    filter: (structure) =>
                        (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER) &&
                        (structure as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0,
                }
            );

            if (!target) {
                target = creep.room.storage;
            }

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            // Collect energy from containers or dropped resources
            let source: Resource | StructureContainer | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: (resource) => resource.resourceType === RESOURCE_ENERGY,
            });

            if (!source) {
                source = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
                    filter: (structure) =>
                        structure.structureType === STRUCTURE_CONTAINER &&
                        (structure as StructureContainer).store[RESOURCE_ENERGY] > 0,
                });
            }

            if (source instanceof Resource) {
                if (creep.pickup(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else if (source instanceof StructureContainer) {
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    }
}
