// ============================================================
// [FILE: core/js/rules.js]
// Чистая логика «змейки». Не знает о конкретной игре:
// всё приходит через options.
// ============================================================

const DIRS = {
  UP:    { x:  0, y: -1 },
  DOWN:  { x:  0, y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x:  1, y:  0 },
};


export function createRules(options) {
  const {
    gridSize,
    foodTypes,      // массив { id, src, weight, scale }
    startSnake,
    previewFood,
  } = options;

  const GRID = gridSize;

  // Предвычисляем кумулятивные веса для быстрого взвешенного выбора.
  const foodWeights = foodTypes.map(t => Math.max(0, t.weight ?? 1));
  const foodWeightsTotal = foodWeights.reduce((a, b) => a + b, 0);

  let snake = [];
  let food = null;
  let currentDir = 'RIGHT';
  let nextDir = 'RIGHT';
  let score = 0;
  let over = false;
  let win = false;


  // ============================================================
  // [BLOCK: random-food-type]
  // Взвешенный случайный индекс: чем больше weight, тем чаще.
  // ============================================================
  function randomFoodType() {
    if (foodWeightsTotal <= 0) return 0;

    let r = Math.random() * foodWeightsTotal;
    for (let i = 0; i < foodWeights.length; i++) {
      r -= foodWeights[i];
      if (r < 0) return i;
    }
    return foodWeights.length - 1;
  }


  function reset() {
    snake = startSnake.map(s => ({ ...s }));
    currentDir = 'RIGHT';
    nextDir = 'RIGHT';
    score = 0;
    over = false;
    win = false;

    generateFood();
    return getState();
  }


  function tick() {
    if (over) return { event: null };
    if (!food) return { event: null };

    const cannotReverse =
      (currentDir === 'UP'    && nextDir === 'DOWN')  ||
      (currentDir === 'DOWN'  && nextDir === 'UP')    ||
      (currentDir === 'LEFT'  && nextDir === 'RIGHT') ||
      (currentDir === 'RIGHT' && nextDir === 'LEFT');
    if (!cannotReverse) currentDir = nextDir;

    const move = DIRS[currentDir];
    const head = snake[0];
    const newHead = {
      x: head.x + move.x,
      y: head.y + move.y,
    };

    if (newHead.x < 0 || newHead.x >= GRID ||
        newHead.y < 0 || newHead.y >= GRID) {
      over = true;
      return { event: 'gameover', win: false, score };
    }

    const willEat = (newHead.x === food.x && newHead.y === food.y);

    const bodyToCheck = willEat ? snake : snake.slice(0, -1);
    const selfCollision = bodyToCheck.some(
      s => s.x === newHead.x && s.y === newHead.y
    );
    if (selfCollision) {
      over = true;
      return { event: 'gameover', win: false, score };
    }

    snake.unshift(newHead);

    if (willEat) {
      score++;

      if (snake.length === GRID * GRID) {
        over = true;
        win = true;
        return { event: 'gameover', win: true, score };
      }

      generateFood();
      return { event: 'eat', score };
    } else {
      snake.pop();
    }

    return { event: null };
  }


  function setDirection(dir) {
    nextDir = dir;
  }


  function isOver() {
    return over;
  }


  function getScore() {
    return score;
  }


  function getState() {
    return { snake, food, score, over, win, dir: currentDir };
  }


  function generateFood() {
    const occupied = new Set(snake.map(c => `${c.x},${c.y}`));
    const free = [];

    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (!occupied.has(`${x},${y}`)) free.push({ x, y });
      }
    }

    if (free.length === 0) return;

    const spot = free[Math.floor(Math.random() * free.length)];

    food = {
      x: spot.x,
      y: spot.y,
      type: randomFoodType(),
    };
  }


  function showPreview() {
    snake = startSnake.map(s => ({ ...s }));
    food = { ...previewFood };
    currentDir = 'RIGHT';
    nextDir = 'RIGHT';
    score = 0;
    over = false;
    win = false;
    return getState();
  }


  return {
    reset,
    tick,
    setDirection,
    isOver,
    getScore,
    getState,
    showPreview,
  };
}