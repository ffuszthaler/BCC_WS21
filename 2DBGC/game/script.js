import Player from './Player.js';
import Collectible from './Collectible.js';
import RandomDispatcher, { randomNumberBetween } from './RandomDispatcher.js';
import PointsDisplay from './PointsDisplay.js';

// global variables
let context;
let lastTickTimestamp;
let player;
let collectibles = [];
let gameObjects = [];
let pointsDisplay;

// config object
const CONFIG = {
  width: 800,
  height: 600,
  debug: false,
};

// remove collectibles from arrays
let removeCollectible = (collectible) => {
  collectibles.splice(collectibles.indexOf(collectible), 1);
  gameObjects.splice(gameObjects.indexOf(collectible), 1);
};

// initializes game, canvas, ...
const init = () => {
  let canvas = document.querySelector('canvas');
  context = canvas.getContext('2d');

  // size canvas according to config
  canvas.setAttribute('width', CONFIG.width);
  canvas.setAttribute('height', CONFIG.height);

  // our player
  player = new Player(context, 100, 100, 100, 100, CONFIG);
  gameObjects.push(player);

  // randomly spawn new collectibles
  let dispatcherOptions = { min: 500, max: 5000 };
  let randomDispatcher = new RandomDispatcher(() => {
    let newX = randomNumberBetween(50, CONFIG.width - 50);
    let newY = randomNumberBetween(50, CONFIG.height - 50);

    let randomCollectible = new Collectible(context, newX, newY, 50, 50, CONFIG);

    collectibles.push(randomCollectible);
    gameObjects.push(randomCollectible);

    randomCollectible.onRemove(() => {
      // remove me
      removeCollectible(randomCollectible);
    });
  }, dispatcherOptions);

  // create points display
  pointsDisplay = new PointsDisplay(context, CONFIG.width - 30, 30);
  gameObjects.push(pointsDisplay);

  // time since start of script execution
  lastTickTimestamp = performance.now();

  gameLoop();
};

// self explanatory
let checkCollisionBetween = (gameObjectA, gameObjectB) => {
  let bbA = gameObjectA.getBoundingBox();
  let bbB = gameObjectB.getBoundingBox();
  if (bbA.x < bbB.x + bbB.w && bbA.x + bbA.w > bbB.x && bbA.y < bbB.y + bbB.h && bbA.y + bbA.h > bbB.y) {
    return true;
  } else return false;
};

const update = (timePassedSinceLastRender) => {
  // update our game objects
  gameObjects.forEach((gameObject) => {
    gameObject.update(timePassedSinceLastRender);
  });

  // check for collisions between collectibles and player
  let removeItems = [];
  collectibles.forEach((collectible) => {
    if (checkCollisionBetween(player, collectible)) {
      // collision happened
      removeItems.push(collectible);
      pointsDisplay.increase();
    }
  });

  // remove colliding collectibles from arrays
  removeItems.forEach((removeItem) => {
    removeCollectible(removeItem);
  });
};

// renders to the canvas
const render = () => {
  // clear the canvas
  context.resetTransform();
  context.clearRect(0, 0, CONFIG.width, CONFIG.height);

  // render our game objects
  gameObjects.forEach((gameObject) => {
    gameObject.render();
  });
};

// main game loop
const gameLoop = () => {
  let timePassedSinceLastRender = performance.now() - lastTickTimestamp;

  update(timePassedSinceLastRender);
  render();

  lastTickTimestamp = performance.now();
  requestAnimationFrame(gameLoop);
};

// execute init() on page load
window.addEventListener('load', () => {
  init();
});
