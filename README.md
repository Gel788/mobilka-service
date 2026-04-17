# Mobilka Service Aggregator

MVP агрегатор сервисных центров по ремонту телефонов с картой, ценами и быстрыми фильтрами. Демо-данные и точка поиска по умолчанию — **Москва и Московская область**, цены в **₽**.

## Что уже реализовано

- Backend API поиска сервисов и прайсов.
- Ранжирование по цене, расстоянию, скорости и рейтингу.
- Пресеты поиска: cheapest, nearest, fastest, verified.
- Fallback-поиск при пустой выдаче (ослабление цены/радиуса).
- Endpoint действия `Я в пути!`.
- Frontend с картой MapLibre, списком сервисов, фильтрами и карточкой контакта.

## Структура

- `frontend` — React + Vite интерфейс агрегатора.
- `backend` — Express + TypeScript API.

## Запуск

```bash
npm install
npm run dev -w backend
npm run dev -w frontend
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

В dev фронт ходит в API через прокси Vite: префикс **`/api`** проксируется на backend (порт 4000), пути `/services`, `/intents`, `/health` тоже поддерживаются.

## Деплой на Vercel

Репозиторий — монорепо: фронт собирается в `frontend/dist`, API поднимается **serverless-функцией** [`api/[...path].ts`](api/[...path].ts) (Express + `serverless-http`). Запросы идут на **`/api/services/...`**, внутри префикс `/api` снимается и отдаётся тот же роутер, что и локально.

1. Импорт проекта в Vercel, root = корень репозитория.
2. **Build Command:** `npm run build` (уже в [`vercel.json`](vercel.json)).
3. **Output Directory:** `frontend/dist`.
4. **Node:** в настройках проекта выбери **Node 20+** (рекомендуется).

Переменная **`VITE_API_URL`** не обязательна: по умолчанию фронт бьёт в `/api` на том же домене. Если вынесешь API на другой хост — задай `VITE_API_URL=https://...` в Environment Variables.

## Тесты

```bash
npm run test -w backend
```

## Основные endpoint'ы

- `GET /services/search`
- `GET /services/:id`
- `GET /services/:id/prices`
- `POST /intents/on-my-way`

## Следующие шаги (V1)

- Кабинет сервисного центра для обновления цен.
- Авторизация и верификация сервисов.
- Отзывы, акции и сравнение сервисов.
- Переход с in-memory данных на PostgreSQL + ORM.
