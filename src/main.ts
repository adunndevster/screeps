// Import modules
import { Harvester } from 'roles/harvester';
import { Carrier } from 'roles/carrier';
import { Upgrader } from 'roles/upgrader';
import { Defender } from 'roles/defender';
import { Warrior } from 'roles/warrior';
import { Claimer } from 'roles/claimer';
import { Unclaimer } from 'roles/unclaimer';
import { RoomManager } from 'managers/room-manager';
import { consUtil } from 'utils/console-utility';


export const loop = () => {
    // Clear memory of dead creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }

    // Room management
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        RoomManager.run(room, 20);
    }

    // Creep roles
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        switch (creep.memory.role) {
            case 'harvester':
                Harvester.run(creep);
                break;
            case 'carrier':
                Carrier.run(creep);
                break;
            case 'upgrader':
                Upgrader.run(creep);
                break;
            case 'defender':
                Defender.run(creep);
                break;
            case 'warrior':
                Warrior.run(creep);
                break;
            case 'claimer':
                Claimer.run(creep);
                break;
            case 'unclaimer':
                Unclaimer.run(creep);
                break;
            default:
                // Default behavior or error handling
                break;
        }
    }

    consUtil.printData();
};



declare global {
  export interface CreepMemory {
    role: string;
    targetRoom?: string;
    harvesting?: boolean;
    delivering?: boolean;
    upgrading?: boolean;
    targetSource?: boolean;
}

}
