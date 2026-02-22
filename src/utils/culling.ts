export const isInsideCameraBounds = (
  x: number,
  y: number,
  camera: { scrollX: number; scrollY: number; width: number; height: number },
  padding: number,
): boolean =>
  x > camera.scrollX - padding &&
  x < camera.scrollX + camera.width + padding &&
  y > camera.scrollY - padding &&
  y < camera.scrollY + camera.height + padding;
