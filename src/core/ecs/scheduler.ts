import type { GameEcsContext, SystemFn } from '../../systems/types';

export class SystemScheduler {
  constructor(private readonly systems: SystemFn[]) {}

  update(context: GameEcsContext): void {
    for (const system of this.systems) {
      system(context);
    }
  }
}
