import RoleMemory from './roledata';
export default class Upgrader extends RoleMemory {
  constructor(activeByDefault: boolean) {
    super(activeByDefault, "upgrader");
  }
  get_spawn_limit(spawn: StructureSpawn): number {
    throw new Error('Method not implemented.');
  }
  execute_creep(spawn: StructureSpawn, creep: Creep): void {
    throw new Error('Method not implemented.');
  }

}
