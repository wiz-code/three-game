import {
  Scene as ThreeScene,
  Fog,
  PerspectiveCamera,
  OrthographicCamera,
  WebGLRenderer,
  Color,
  Clock,
  Vector3,
} from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { Octree } from 'three/addons/math/Octree.js';
import { debounce } from 'throttle-debounce';

import {
  Game as GameSettings,
  Scene,
  Camera,
  Renderer,
  Light,
  PlayerSettings,
  Grid,
  Ground,
  World,
} from './settings';

import FirstPersonControls from './controls';
import {
  Characters,
  Stages,
  Compositions,
  Tweeners,
  Ammo as AmmoData,
} from './data';
import CollidableManager from './collidable-manager';
import CharacterManager from './character-manager';
import SceneManager from './scene-manager';
import Character from './character';
import Player from './player';
import Ammo from './ammo';
import Obstacle from './obstacle';
import { createStage } from './stages';

const { floor, exp } = Math;

const resistances = Object.entries(World.Resistance);
const damping = {};
const getDamping = (delta) => {
  for (let i = 0, l = resistances.length; i < l; i += 1) {
    const [key, value] = resistances[i];
    const result = exp(-value * delta) - 1;
    damping[key] = result;
  }

  return damping;
};

class Game {
  constructor() {
    this.clock = new Clock();
    this.worldOctree = new Octree();

    this.windowHalf = {
      width: floor(window.innerWidth / 2),
      height: floor(window.innerHeight / 2),
    };

    this.container = document.getElementById('container');

    this.renderer = new WebGLRenderer({ antialias: false });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(new Color(0x000000));
    this.renderer.setPixelRatio(Renderer.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.enabled = Renderer.ShadowMap.enabled;
    // renderer.shadowMap.type = Renderer.ShadowMap.type;
    // renderer.toneMapping = Renderer.ShadowMap.toneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.scenes = new SceneManager(this.renderer);

    this.scene = {};
    this.camera = {};

    this.scene.field = new ThreeScene();
    this.scene.field.background = new Color(Scene.background);
    this.scene.field.fog = new Fog(
      Scene.Fog.color,
      Scene.Fog.near,
      Scene.Fog.far,
    );

    this.scene.screen = new ThreeScene();

    this.camera.field = new PerspectiveCamera(
      Camera.FOV,
      Camera.Aspect,
      Camera.near,
      Camera.far,
    );
    this.camera.field.rotation.order = Camera.order;
    this.camera.field.position.set(0, 0, 0);

    this.camera.screen = new OrthographicCamera(
      -this.windowHalf.width,
      this.windowHalf.width,
      this.windowHalf.height,
      -this.windowHalf.height,
      0.1,
      1000,
    );

    this.data = {};
    this.data.stages = new Map(Stages);
    this.data.characters = new Map(Characters);
    this.data.compositions = new Map(Compositions);
    this.data.ammos = new Map(AmmoData);
    this.data.tweeners = new Map(Tweeners);

    this.objects = new CollidableManager(this.scene.field, this.worldOctree);
    this.characters = new CharacterManager(
      this.scene.field,
      this.objects,
      this.worldOctree,
    );

    this.ammos = new Map();
    const ammoNames = Array.from(this.data.ammos.keys());
    ammoNames.forEach((name) => {
      const ammo = new Ammo(name);
      this.ammos.set(name, ammo);
    });

    this.controls = null;
    this.player = null;
    this.stage = null;

    // const stage = createStage('firstStage');
    // scene.field.add(stage);

    /* const collisionObject = new CollisionObject(scene.field, worldOctree);
    const stone = CollisionObject.createStone(80, 1, 15);
    stone.object.position.set(-2200, 300, 0);
    stone.collider.center = new Vector3(-2200, 300, 0);
    collisionObject.add(stone);
    const ammo = new Ammo(scene.field, worldOctree);
    const player = new Player(camera.field, ammo, collisionObject, worldOctree);

    setInterval(() => {
      stone.object.position.set(-2000, 300, 0);
      stone.velocity = new Vector3(0, 0, 0);
      stone.collider.center = new Vector3(-2200, 300, 0);
    }, 10000);

    player.init('firstStage'); */

    // ゲーム管理変数
    this.ready = false;
    this.mode = 'loading'; // 'loading', 'opening', 'play', 'gameover'
    this.stageIndex = 0;
    this.checkPointIndex = 0;

    /// ///////////////
    const stageNameList = this.data.compositions.get('stage');
    const stageName = stageNameList[this.stageIndex];
    const stageData = this.data.stages.get(stageName);
    const [checkPoint] = stageData.checkPoints;

    const player = new Player(this.camera.field, 'hero1', this.ammos);
    player.setPosition(checkPoint);

    const [stone] = this.createObstacle(stageData);
    /* const stone = new Obstacle('round-stone');
    const { obstacles } = data;
    const obstacle = obstacles.find((object) => object.name === 'round-stone') */
    /// //////////////

    this.objects.add('ammo', this.ammos.get('small-bullet'));
    this.objects.add('obstacle', stone);
    // stone.collider.center = new Vector3(-2200, 300, 0);

    this.setPlayer(player);
    this.setMode('play');
    this.ready = true;
    /// ///////////

    const onResize = function onResize() {
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      this.windowHalf.width = floor(iw / 2);
      this.windowHalf.height = floor(ih / 2);

      this.camera.field.aspect = iw / ih;
      this.camera.field.updateProjectionMatrix();

      this.camera.screen.left = -this.windowHalf.width;
      this.camera.screen.right = this.windowHalf.width;
      this.camera.screen.top = this.windowHalf.height;
      this.camera.screen.bottom = -this.windowHalf.height;
      this.camera.screen.updateProjectionMatrix();

      this.renderer.setSize(iw, ih);

      if (this.ready) {
        this.controls.handleResize();
      }
    };

    this.onResize = debounce(GameSettings.resizeDelayTime, onResize.bind(this));

    window.addEventListener('resize', this.onResize);

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = 'auto';
    this.stats.domElement.style.bottom = 0;
    this.container.appendChild(this.stats.domElement);
  }

  createObstacle(stageData) {
    const list = [];
    const { obstacles } = stageData;
    obstacles.forEach((obstacleData) => {
      const obstacle = new Obstacle(obstacleData.name);
      obstacle.collider.center.copy(obstacleData.position);
      obstacleData.tweeners.forEach((tweenerName) => {
        obstacle.addTweener(this.data.tweeners.get(tweenerName));
      });
      list.push(obstacle);
    });
    return list;
  }

  setPlayer(character) {
    if (this.player == null) {
      this.player = character;
      this.characters.add(this.player);

      this.controls = new FirstPersonControls(
        this.scene.screen,
        this.camera.field,
        this.player,
        this.renderer.domElement,
      );
    }
  }

  removePlayer(character) {
    if (this.player != null) {
      this.player = null;
      this.controls.dispose();

      this.characters.remove(character);
    }
  }

  setMode(mode) {
    this.mode = mode;

    switch (this.mode) {
      case 'loading': {
      }
      case 'initial': {
      }
      case 'play': {
        this.setStage();

        break;
      }

      default: {
      }
    }
  }

  setStage() {
    this.scenes.clear();
    this.scenes.add('field', this.scene.field, this.camera.field);
    this.scenes.add('screen', this.scene.screen, this.camera.screen);

    const stageNames = this.data.compositions.get('stage');
    const stageName = stageNames[this.stageIndex];

    this.clearStage();

    this.stage = createStage(stageName);
    this.scene.field.add(this.stage);

    this.worldOctree.fromGraphNode(this.stage);
  }

  clearStage() {
    if (this.stage != null) {
      this.scene.field.clear();
      this.worldOctree.clear();
    }
  }

  nextStage() {
    const currentIndex = this.stageIndex + 1;
    this.setStage(currentIndex);
  }

  rewindStage() {
    const currentIndex = this.stageIndex - 1;
    this.setStage(currentIndex);
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
  }

  start() {
    this.checkPointIndex = 0;
  }

  restart(checkPoint) {}

  clear() {}

  update() {
    if (!this.ready) {
      return;
    }

    const deltaTime = this.clock.getDelta() / GameSettings.stepsPerFrame;
    /* this.#damping.ground = exp(-World.Resistance.ground * deltaTime) - 1;
    this.#damping.air = exp(-World.Resistance.air * deltaTime) - 1;
    this.#damping.obstacle = exp(-World.Resistance.object * deltaTime) - 1; */
    const damping = getDamping(deltaTime);

    for (let i = 0; i < GameSettings.stepsPerFrame; i += 1) {
      this.controls.update(deltaTime);
      this.characters.update(deltaTime, damping);
      this.objects.update(deltaTime, damping);
    }

    this.scenes.update();
    this.stats.update();
  }
}

export default Game;
