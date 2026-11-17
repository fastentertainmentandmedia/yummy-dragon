// ============================================================
// [FILE: core/js/render.js]
// Отрисовка «змейки». Не знает о конкретной игре:
// ассеты и размер поля приходят через options.
// ============================================================

export function createRenderer(canvas, options = {}) {

  const {
    gridSize,
    foodTypes = [],        // массив { id, src, weight, scale }
    headImageSrc,
    bodyImageSrc,
    onImageReady = () => {},
  } = options;

  const ctx = canvas.getContext('2d');

  let cellW = canvas.width  / gridSize;
  let cellH = canvas.height / gridSize;
  let currentGrid = gridSize;

  // ----------------------------------------------------------
  // [BLOCK: food-assets]
  // Индекс в массиве = food.type.
  // ----------------------------------------------------------
  const foodImages = foodTypes.map(t => {
    const img = new Image();
    img.onload = onImageReady;
    img.src = t.src;
    return img;
  });

  // ----------------------------------------------------------
  // Изображения головы и тела
  // ----------------------------------------------------------
  const headImage = new Image();
  headImage.src = headImageSrc;
  let headImageReady = false;
  headImage.onload = () => { headImageReady = true; onImageReady(); };

  const bodyImage = new Image();
  bodyImage.src = bodyImageSrc;
  let bodyImageReady = false;
  bodyImage.onload = () => { bodyImageReady = true; onImageReady(); };

  let COLORS = readColors();


  function readColors() {
    const s = getComputedStyle(document.documentElement);
    const read = (name, fallback) => {
      const v = s.getPropertyValue(name).trim();
      return v || fallback;
    };

    return {
      grid:      read('--color-grid',            '#b9b9b9'),
      snake:     read('--color-snake',           '#d14a4a'),
      snakeHead: read('--color-snake-head',      '#d14a4a'),
      food:      read('--color-food',            '#33c4b8'),
      overlay:   read('--color-gameover-bg',     'rgba(0, 0, 0, 0.7)'),
      overText:  read('--color-gameover-text',   '#f3c6a8'),
      overHint:  read('--color-gameover-hint',   '#ffffff'),
    };
  }


  function refreshColors() {
    COLORS = readColors();
  }


  function resize(w, h, grid) {
    canvas.width  = w;
    canvas.height = h;
    currentGrid = grid;
    cellW = w / grid;
    cellH = h / grid;
  }


  // ==========================================================
  // [BLOCK: render]
  // ==========================================================
  function render(state) {
    const { snake, food, over, win, paused } = state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Сетка ---
    for (let i = 0; i <= currentGrid; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, canvas.height);
      ctx.strokeStyle = COLORS.grid;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(canvas.width, i * cellH);
      ctx.strokeStyle = COLORS.grid;
      ctx.stroke();
    }

    // --- Еда ---
    if (food && food.type !== undefined) {
      const foodImg = foodImages[food.type];
      const foodDef = foodTypes[food.type];

      if (foodImg && foodImg.complete) {
        const scale = foodDef?.scale ?? 1;
        const size = Math.min(cellW, cellH) * scale;
        const cx = food.x * cellW + cellW / 2;
        const cy = food.y * cellH + cellH / 2;

        ctx.save();
        ctx.drawImage(foodImg, cx - size / 2, cy - size / 2, size, size);
        ctx.restore();
      }
    }

    // --- Змейка ---
    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      const cx = seg.x * cellW + cellW / 2;
      const cy = seg.y * cellH + cellH / 2;

      if (i === 0) {
        if (headImageReady) {
          drawHeadImage(ctx, cx, cy, cellW, cellH, state.dir);
        } else {
          drawFallbackHead(ctx, cx, cy, cellW, cellH);
        }
      } else {
        if (bodyImageReady) {
          drawBodyImage(ctx, cx, cy, cellW, cellH);
        } else {
          drawFallbackBody(ctx, cx, cy, cellW, cellH);
        }
      }
    }

    // --- Game Over ---
    if (over && snake.length > 0) {
      drawGameOver(ctx, canvas, win);
    }

    // --- Pause ---
    if (paused && !over && snake.length > 0) {
      drawPause(ctx, canvas);
    }
  }


  // ==========================================================
  // [BLOCK: body]
  // ==========================================================
  function drawBodyImage(ctx, cx, cy, cw, ch) {
    const size = Math.min(cw, ch) * 1.3;
    ctx.drawImage(bodyImage, cx - size / 2, cy - size / 2, size, size);
  }


  function drawFallbackBody(ctx, cx, cy, cw, ch) {
    const pad = Math.min(cw, ch) * 0.08;
    ctx.fillStyle = COLORS.snake;
    ctx.fillRect(
      cx - cw / 2 + pad,
      cy - ch / 2 + pad,
      cw - pad * 2,
      ch - pad * 2
    );
  }


  // ==========================================================
  // [BLOCK: head]
  // ==========================================================
  function drawHeadImage(ctx, cx, cy, cw, ch, dir) {
    const size = Math.min(cw, ch) * 1.9;

    ctx.save();
    ctx.translate(cx, cy);

    switch (dir) {
      case 'LEFT':
        break;
      case 'RIGHT':
        ctx.scale(-1, 1);
        break;
      case 'UP':
        ctx.rotate(Math.PI / 2);
        break;
      case 'DOWN':
        ctx.rotate(-Math.PI / 2);
        break;
    }

    ctx.drawImage(headImage, -size / 2, -size / 2, size, size);
    ctx.restore();
  }


  function drawFallbackHead(ctx, cx, cy, cw, ch) {
    const pad = Math.min(cw, ch) * 0.08;
    ctx.fillStyle = COLORS.snakeHead;
    ctx.fillRect(
      cx - cw / 2 + pad,
      cy - ch / 2 + pad,
      cw - pad * 2,
      ch - pad * 2
    );
  }


  // ==========================================================
  // [BLOCK: game-over]
  // ==========================================================
  function drawGameOver(ctx, canvas, isWin) {
    ctx.save();

    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const title = isWin ? 'НЕВЕРОЯТНАЯ ПОБЕДА!' : 'ХОРОШАЯ ПОПЫТКА';
    const hint  = 'нажмите ИГРАТЬ чтобы начать заново';

    const maxWidth = canvas.width * 0.85;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let titleSize = 40;
    do {
      ctx.font = `bold ${titleSize}px monospace`;
      if (ctx.measureText(title).width <= maxWidth) break;
      titleSize -= 2;
    } while (titleSize > 12);

    ctx.fillStyle = COLORS.overText;
    ctx.fillText(title, canvas.width / 2, canvas.height / 2);

    let hintSize = 18;
    do {
      ctx.font = `${hintSize}px monospace`;
      if (ctx.measureText(hint).width <= maxWidth) break;
      hintSize -= 1;
    } while (hintSize > 10);

    ctx.fillStyle = COLORS.overHint;
    ctx.fillText(hint, canvas.width / 2, canvas.height / 2 + 50);

    ctx.restore();
  }


  // ==========================================================
  // [BLOCK: pause-overlay]
  // ==========================================================
  function drawPause(ctx, canvas) {
    ctx.save();

    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const title = 'ПАУЗА';
    const hint  = 'Нажмите ПРОДОЛЖИТЬ чтобы вернуться';

    const maxWidth = canvas.width * 0.85;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let titleSize = 40;
    do {
      ctx.font = `bold ${titleSize}px monospace`;
      if (ctx.measureText(title).width <= maxWidth) break;
      titleSize -= 2;
    } while (titleSize > 12);

    ctx.fillStyle = COLORS.overText;
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);

    let hintSize = 20;
    do {
      ctx.font = `${hintSize}px monospace`;
      if (ctx.measureText(hint).width <= maxWidth) break;
      hintSize -= 1;
    } while (hintSize > 10);

    ctx.fillStyle = COLORS.overHint;
    ctx.fillText(hint, canvas.width / 2, canvas.height / 2 + 30);

    ctx.restore();
  }


  return {
    render,
    resize,
    refreshColors,
  };
}