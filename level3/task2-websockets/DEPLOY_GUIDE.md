# WebSocket Chat Deployment Guide

This guide deploys the Level 3 Task 2 application:

- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas

## 1. Prepare MongoDB Atlas

1. Open MongoDB Atlas.
2. Create a database user or use an existing one.
3. Add an IP access rule. For initial testing, `0.0.0.0/0` allows connections from Render.
4. Copy the connection string from Atlas.
5. Replace the username, password, cluster, and database name in the connection string.

The previous example environment file contained a database credential. Rotate that MongoDB password before deploying if it was ever committed or shared.

## 2. Push the project to GitHub

From the repository root, run:

```powershell
git add .
git commit -m "Prepare WebSocket chat for Render and Vercel"
git push origin main
```

The backend `.gitignore` excludes `.env` and `node_modules`. Never commit the real `.env` file.

## 3. Deploy the backend to Render

1. Open [Render](https://render.com) and sign in with GitHub.
2. Select **New > Web Service**.
3. Choose this GitHub repository.
4. Use these service settings:

```text
Root Directory: level3/task2-websockets/backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

5. Add these environment variables in Render:

```text
PORT=10000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=use_a_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

6. Select **Create Web Service**.
7. Wait for the deployment to finish.
8. Copy the Render service URL. It will look similar to:

```text
https://realtime-chat-backend.onrender.com
```

9. Test the URL in a browser. The response should be:

```text
Level 3 Task 2 - WebSocket Chat API is running
```

## 4. Connect the frontend to Render

Open `level3/task2-websockets/frontend/script.js` and change:

```javascript
const BACKEND_URL = "http://localhost:5000";
```

to your real Render URL:

```javascript
const BACKEND_URL = "https://realtime-chat-backend.onrender.com";
```

Do not add a trailing slash to the URL.

Commit and push the change:

```powershell
git add level3/task2-websockets/frontend/script.js
git commit -m "Connect frontend to Render backend"
git push origin main
```

## 5. Deploy the frontend to Vercel

1. Open [Vercel](https://vercel.com) and sign in with GitHub.
2. Select **Add New > Project**.
3. Import the same GitHub repository.
4. Use these project settings:

```text
Root Directory: level3/task2-websockets/frontend
Framework Preset: Other
Build Command: leave empty
Output Directory: .
```

5. Select **Deploy**.
6. Copy the Vercel URL. It will look similar to:

```text
https://realtime-chat.vercel.app
```

## 6. Update Render CORS

After Vercel gives you the frontend URL:

1. Open the backend service in Render.
2. Open **Environment**.
3. Change the variable to your real Vercel URL:

```text
FRONTEND_URL=https://realtime-chat.vercel.app
```

4. Save the changes and redeploy the service.

This value must match the Vercel URL exactly. Do not add a trailing slash.

## 7. Test the deployed application

Open the Vercel URL and check the following:

1. Sign up with a valid `@gmail.com` address.
2. Confirm the account-created message appears.
3. Log in with the email and password.
4. Open the Vercel URL in two separate browser tabs.
5. Log in as two different users.
6. Send messages between the two tabs.
7. Refresh the page and confirm the chat remains open.
8. Confirm previous messages reload from MongoDB.
9. Click **Logout** and confirm the Login screen appears.

## Common deployment problems

| Problem | Fix |
|---|---|
| Frontend still calls localhost | Update `BACKEND_URL` in `frontend/script.js`, commit, and push. |
| CORS error | Set Render `FRONTEND_URL` to the exact Vercel URL and redeploy. |
| Socket.io connection fails | Check that the frontend uses the Render URL and that Render is running. |
| MongoDB connection error | Check `MONGO_URI` and the Atlas IP access list. |
| Render service crashes | Check Render logs and confirm `npm install` and `npm start` are configured. |
| Login returns 401 | Check the email and password, and confirm the frontend uses the correct backend. |
| First request is slow | The Render free service may be waking up after inactivity. |
