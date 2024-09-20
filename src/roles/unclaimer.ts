export class Unclaimer {
    public static run(creep: Creep): void {
        const targetRoom:any = creep.memory.targetRoom;
        if (creep.room.name !== targetRoom) {
            const exitDir:any = creep.room.findExitTo(targetRoom);
            const exit = creep.pos.findClosestByRange(exitDir);
            if (exit) {
                creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        } else {
            if (creep.attackController(creep.room.controller!) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller!, { visualizePathStyle: { stroke: '#ff0000' } });
            } else {
                creep.attackController(creep.room.controller!);
            }
        }
    }
}
