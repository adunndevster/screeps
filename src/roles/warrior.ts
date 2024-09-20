export class Warrior {
    public static run(creep: Creep): void {
        const targetRoom: any = creep.memory.targetRoom;
        if (creep.room.name !== targetRoom) {
            const exitDir:any = creep.room.findExitTo(targetRoom);
            const exit = creep.pos.findClosestByRange(exitDir);
            if (exit) {
                creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else {
            const hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if (hostile) {
                if (creep.attack(hostile) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile, { visualizePathStyle: { stroke: '#ff0000' } });
                }
            } else {
                // Attack hostile structures
                const structures = creep.room.find(FIND_HOSTILE_STRUCTURES);
                if (structures.length > 0) {
                    if (creep.attack(structures[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(structures[0], { visualizePathStyle: { stroke: '#ff0000' } });
                    }
                }
            }
        }
    }
}
