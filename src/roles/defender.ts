export class Defender {
    public static run(creep: Creep): void {
        const hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (hostile) {
            if (creep.attack(hostile) === ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile, { visualizePathStyle: { stroke: '#ff0000' } });
            }
        } else {
            // Move to a defensive position or patrol
            const defendFlag = Game.flags['DefendFlag'];
            if (defendFlag) {
                creep.moveTo(defendFlag, { visualizePathStyle: { stroke: '#ffffff' } });
            }
        }
    }
}
