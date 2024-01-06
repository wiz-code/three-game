import { Texture, SpriteMaterial, Sprite } from 'three';
import { Screen } from './settings';
import textures from './textures';

const { floor } = Math;

export const createSight = () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  textures.sight(context);

  const texture = new Texture(canvas);
  texture.needsUpdate = true;

  const material = new SpriteMaterial({
    color: 0xffffff,
    map: texture,
  });

  const sprite = new Sprite(material);
  sprite.scale.set(Screen.sightSize, Screen.sightSize, 0);
  sprite.position.set(0, 0, -10);

  return sprite;
};

export const createPovIndicator = () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  textures.isoscelesTriangle(context);

  const halfHeight = window.innerHeight / 2;

  const texture = new Texture(canvas);
  texture.needsUpdate = true;

  const material = new SpriteMaterial({
    color: 0xffffff,
    map: texture,
  });

  const sprite = new Sprite(material);
  sprite.visible = false;
  sprite.scale.set(Screen.sightPovSize, Screen.sightPovSize, 0);
  sprite.position.setZ(-10);

  return sprite;
};
