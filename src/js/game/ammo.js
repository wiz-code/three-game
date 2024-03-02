import {
  IcosahedronGeometry,
  OctahedronGeometry,
  BufferGeometry,
  WireframeGeometry,
  MeshBasicMaterial,
  LineBasicMaterial,
  PointsMaterial,
  Mesh,
  LineSegments,
  Points,
  Group,
  Float32BufferAttribute,
  Texture,
  Vector3,
  NormalBlending,
} from 'three';

import Bullet from './bullet';
import { Ammo as AmmoData } from './data';
import Publisher from './publisher';
import textures from './textures';

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
textures.crossStar(context);

const texture = new Texture(canvas);
texture.needsUpdate = true;

class Ammo extends Publisher {
  #vecA = new Vector3();

  #vecB = new Vector3();

  #vecC = new Vector3();

  constructor(name) {
    super();

    const dataMap = new Map(AmmoData);
    const ammo = dataMap.get(name);

    this.name = name;

    const {
      color,
      wireColor,
      pointColor,
      pointSize,

      radius,
      detail,
      numAmmo,
    } = { ...ammo };

    const geom = new IcosahedronGeometry(radius, detail);
    const geomWire = new WireframeGeometry(geom);
    const pointsGeom = new OctahedronGeometry(radius + 4, detail);
    const pointsVertices = pointsGeom.attributes.position.array.slice(0);

    const bufferGeom = new BufferGeometry();
    bufferGeom.setAttribute(
      'position',
      new Float32BufferAttribute(pointsVertices, 3),
    );
    bufferGeom.computeBoundingSphere();

    const mat = new MeshBasicMaterial({ color });
    const wireMat = new LineBasicMaterial({
      color: wireColor,
    });

    const pointsMat = new PointsMaterial({
      color: pointColor,
      size: pointSize,
      map: texture,
      blending: NormalBlending,
      alphaTest: 0.5,
    });

    this.list = [];
    this.index = 0;

    for (let i = 0; i < numAmmo; i += 1) {
      const mesh = new Mesh(geom, mat);
      const wireMesh = new LineSegments(geomWire, wireMat);
      const pointsMesh = new Points(bufferGeom, pointsMat);

      const group = new Group();
      group.add(mesh);
      group.add(wireMesh);
      group.add(pointsMesh);

      const bullet = new Bullet(i, name, group);

      this.list.push(bullet);
    }
  }

  setActive(bool) {
    this.list.forEach((bullet) => {
      bullet.setActive(bool);
    });
  }
}

export default Ammo;
