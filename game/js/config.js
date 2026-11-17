// ============================================================
// [FILE: game/js/config.js]
// Данные конкретной игры. Никакой логики.
// ============================================================

export const config = {
  // Игровое поле
  GRID_SIZE: 14,

  // Режим цикла: 'interval' | 'raf' | 'manual'
  LOOP_MODE: 'interval',

  // Лимит на игрока
  PLAY_LIMIT_MINUTES: 5,

  // через сколько часов лимит сбросится
  LIMIT_RESET_HOURS: 4,

  // Ключ хранения игрока (уникальный для каждой игры!)
  STORAGE_KEY: 'yummy_dragon',

  // Защита от «зависшей» вкладки
  SESSION_FLUSH_TIMEOUT_MS: 60000,

  TICK_INTERVAL_MS: 200,          // стартовый интервал
  TICK_MIN_MS: 95,                // минимальный (максимальная скорость)
  TICK_STEP_MS: 3,                // на сколько уменьшать за каждое очко

  // ----------------------------------------------------------
  // Ассеты
  // ----------------------------------------------------------
  HEAD_IMAGE: 'game/assets/head.svg',
  BODY_IMAGE: 'game/assets/body.svg',

  // Список видов еды. Индекс в массиве = food.type.
  // weight — вес для взвешенного случайного выбора.
  // scale  — масштаб отрисовки относительно клетки.
FOOD_TYPES: [
  // частые 
  { id: 'gyoza',   src: 'game/assets/food/gyoza.png',   weight: 4, scale: 1 },
  { id: 'noodles', src: 'game/assets/food/noodles.svg', weight: 5, scale: 1 },
  { id: 'ramen',   src: 'game/assets/food/ramen.svg',   weight: 5, scale: 1 },
  { id: 'sushi',   src: 'game/assets/food/sushi.svg',   weight: 4, scale: 1 },
  { id: 'kimpab',  src: 'game/assets/food/kimpab.png',  weight: 5, scale: 1 },
  { id: 'onigiri', src: 'game/assets/food/onigiri.png', weight: 5, scale: 1 },

  // редкий
  { id: 'poke',    src: 'game/assets/food/poke.png',    weight: 3, scale: 1 },
  { id: 'mochi',   src: 'game/assets/food/mochi.png',   weight: 2, scale: 1 },
],

  // ----------------------------------------------------------
  // Стартовые позиции (под поле GRID_SIZE)
  // ----------------------------------------------------------
  START_SNAKE: [
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 },
  ],

  PREVIEW_FOOD: { x: 9, y: 7, type: 0 },
};

// Set false for production
export const DEBUG_DISABLE_LIMIT = true;