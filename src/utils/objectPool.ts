export class ObjectPool<T> {
  private readonly freeObjects: T[] = [];
  private readonly activeObjects: Set<T> = new Set<T>();

  constructor(
    private readonly factory: () => T,
    prewarm = 0,
  ) {
    for (let index = 0; index < prewarm; index += 1) {
      this.freeObjects.push(this.factory());
    }
  }

  acquire(): T {
    const object = this.freeObjects.pop() ?? this.factory();
    this.activeObjects.add(object);
    return object;
  }

  release(object: T): void {
    if (!this.activeObjects.has(object)) {
      return;
    }
    this.activeObjects.delete(object);
    this.freeObjects.push(object);
  }

  forEachActive(callback: (object: T) => void): void {
    this.activeObjects.forEach(callback);
  }
}
