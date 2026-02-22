import type Phaser from 'phaser';

export const createMenuPanel = (
  scene: Phaser.Scene,
  title: string,
  subtitle: string,
): {
  panel: Phaser.GameObjects.Image;
  titleText: Phaser.GameObjects.Text;
  subtitleText: Phaser.GameObjects.Text;
} => {
  const panel = scene.add
    .image(960, 540, 'ui-panel')
    .setScrollFactor(0)
    .setDepth(50)
    .setAlpha(0.92);

  const titleText = scene.add
    .text(960, 420, title, {
      fontFamily: 'Trebuchet MS',
      fontSize: '62px',
      color: '#f8fafc',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(51);

  const subtitleText = scene.add
    .text(960, 510, subtitle, {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#cbd5e1',
      align: 'center',
    })
    .setOrigin(0.5)
    .setDepth(51);

  return { panel, titleText, subtitleText };
};
