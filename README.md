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

В dev фронт ходит в API через прокси Vite (относительные URL). Для прод-сборки без общего origin можно задать `VITE_API_URL` (например `https://api.example.com`).

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
