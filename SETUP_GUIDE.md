
## 4. Level 3 setup (Advanced — pick any 2 of the 3)

Each Level 3 task is **self-contained** with its own `package.json` and `.env`, so you
can set them up independently and in any order. Stop any Level 1/2 backend still running
on port 5000 before starting one of these (or change `PORT` in its `.env`).

### 4.1 Task 1 — Full-Stack App (MERN) — no new code to run locally
This task reuses your working **Level 1 + Level 2** app (Express + MongoDB + React) and
is about making it deployable. Open `level3/task1-full-stack-app/DEPLOY_GUIDE.md` and
follow it end-to-end:
1. Add `helmet` / `compression` to `level2/backend`
2. Set production env vars on your host
3. Deploy the backend (Render/Railway example given)
4. Point the React app's `axios` baseURL at the deployed backend and deploy it (Vercel example given)

### 4.2 Task 2 — WebSockets (real-time chat)
```bash
cd level3/task2-websockets/backend
npm install
cp .env.example .env
```
Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/codveda_level3_chat
JWT_SECRET=make_this_a_long_random_string
```
Start it:
```bash
npm run dev
# "HTTP + WebSocket server running on http://localhost:5000"
```
Open the frontend:
```bash
cd level3/task2-websockets/frontend
npx serve .
```
Open the printed URL **in two separate browser tabs** (or one normal + one incognito),
sign up as two different users, and chat between them in real time — messages persist
to MongoDB and reload as history when you reconnect.

### 4.3 Task 3 — GraphQL API
```bash
cd level3/task3-graphql-api/backend
npm install
cp .env.example .env
```
Edit `.env` (same pattern — its own `MONGO_URI`/`JWT_SECRET`):
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/codveda_level3_graphql
JWT_SECRET=make_this_a_long_random_string
```
Start it:
```bash
npm run dev
# "GraphQL server ready at http://localhost:5000/graphql"
```
Open **http://localhost:5000/graphql** in a browser — this opens **Apollo Sandbox**.
Follow `level3/task3-graphql-api/backend/EXAMPLE_QUERIES.md` in order: signup → paste
the token into the Sandbox's "Headers" panel as `{"Authorization": "Bearer <token>"}` →
run the `me`, `createProduct`, `products`, `updateProduct`, `deleteProduct` operations.

---

## 5. Common issues

| Problem | Fix |
|---|---|
| `MongoServerError: bad auth` | Wrong username/password in `MONGO_URI` — re-copy from Atlas |
| `EADDRINUSE: port 5000` | Another server (Level 1 or Level 2 backend) is already running — stop it first |
| React can't reach API / CORS error | Make sure the backend is running on port 5000 and `cors()` is enabled in `server.js` (it already is) |
| `MongooseServerSelectionError` | Atlas IP allowlist doesn't include your current IP — add `0.0.0.0/0` while developing |
| 401 on product create/update/delete | You're not logged in, or didn't paste the token correctly in `Authorization: Bearer <token>` |
| Socket.io: `Authentication error: no token` | Frontend didn't pass `auth: { token }` when calling `io(...)` — check `script.js` sets it after login |
| Socket.io: connects then immediately disconnects | JWT_SECRET in the WebSocket backend's `.env` doesn't match the token you're sending (make sure you signed up/logged in against *that same* backend) |
| GraphQL: "Not authenticated" on `createProduct` | You forgot to add the `Authorization` header in Apollo Sandbox's Headers panel, or the token expired |
| GraphQL Sandbox doesn't load | Make sure you're hitting `/graphql` (not `/`) and the server logged "GraphQL server ready" |
| Two Level 3 backends both trying to use port 5000 | Only run one at a time, or change `PORT` in one `.env` (e.g. `5001`) and update the frontend's URL to match |

---

## 6. Git & GitHub (do this alongside development, not just at the end)

```bash
git init
git add .
git commit -m "Level 1 & Level 2: REST API, MongoDB, JWT auth, React frontend"
git remote add origin <your-empty-github-repo-url>
git branch -M main
git push -u origin main
```
Add a `.gitignore` in each backend/frontend folder so `node_modules` and `.env` aren't committed:
```
node_modules/
.env
```

---

## 7. Submission checklist (per Codveda instructions)

- [ ] Complete **any 2 of the 3 tasks per level** (this project includes all 3 for each level, pick your best two per level if time is short)
- [ ] Push code to a public GitHub repo, keep a **separate file/folder per level** (already done — `level1/`, `level2/`, `level3/`)
- [ ] Record a short video walking through what you built
- [ ] Post on LinkedIn: tag **@Codveda**, include the video + GitHub repo link, and use hashtags `#CodvedaJourney #CodvedaExperience #FutureWithCodveda #CodvedaAchievements #CodvedaProjects`
- [ ] Submit via the Codveda submission form once it's shared


