const BACKEND_URL = "https://real-time-chat-da7o.onrender.com";
const API_URL = `${BACKEND_URL}/api/auth`;
const ROOM = "general";

let socket = null;
let currentUser = null;

// --- DOM refs ---
const authScreen = document.getElementById("auth-screen");
const chatScreen = document.getElementById("chat-screen");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authError = document.getElementById("auth-error");
const messagesEl = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const meLabel = document.getElementById("me-label");
const onlineUsersEl = document.getElementById("online-users");
const typingEl = document.getElementById("typing-indicator");
const logoutBtn = document.getElementById("logout-btn");

// --- Tab switching ---
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
});
tabSignup.addEventListener("click", () => {
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// --- Auth: login ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";
  authError.classList.remove("success");
  authError.classList.add("error");
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    startChat(json.token, json.user);
  } catch (err) {
    authError.textContent = err.message;
  }
});

// --- Auth: signup ---
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";
  authError.classList.remove("success");
  authError.classList.add("error");
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    document.getElementById("login-email").value = email;
    document.getElementById("login-password").value = "";
    authError.textContent = "Account created successfully. Please log in.";
    authError.classList.remove("error");
    authError.classList.add("success");
    tabLogin.click();
  } catch (err) {
    authError.textContent = err.message;
  }
});

// --- Start the authenticated socket connection ---
function startChat(token, user) {
  currentUser = user;
  localStorage.setItem("chat_token", token);
  localStorage.setItem("chat_user", JSON.stringify(user));

  authScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
  meLabel.textContent = `Logged in as ${user.name}`;

  socket = io(BACKEND_URL, {
    auth: { token }, // JWT sent during the WebSocket handshake, verified server-side
  });

  socket.on("connect", () => {
    socket.emit("room:join", ROOM);
  });

  socket.on("room:history", (history) => {
    messagesEl.innerHTML = "";
    history.forEach(renderMessage);
    scrollToBottom();
  });

  socket.on("message:new", (msg) => {
    renderMessage(msg);
    scrollToBottom();
  });

  socket.on("room:notice", (text) => {
    const p = document.createElement("p");
    p.className = "msg";
    p.style.color = "#94a3b8";
    p.style.fontStyle = "italic";
    p.textContent = text;
    messagesEl.appendChild(p);
    scrollToBottom();
  });

  socket.on("user:online", ({ name }) => {
    onlineUsersEl.textContent = `${name} is online`;
    setTimeout(() => (onlineUsersEl.textContent = ""), 3000);
  });

  socket.on("typing", ({ name }) => {
    typingEl.textContent = `${name} is typing...`;
    clearTimeout(window.__typingTimeout);
    window.__typingTimeout = setTimeout(() => (typingEl.textContent = ""), 1500);
  });

  socket.on("notification", ({ from, text }) => {
    alert(`Notification from ${from}: ${text}`);
  });

  socket.on("connect_error", (err) => {
    authError.textContent = `Connection failed: ${err.message}`;
    if (err.message.toLowerCase().includes("token")) {
      logoutBtn.click();
    }
  });
}

// Keep the chat open when the logged-in user refreshes the page.
const savedToken = localStorage.getItem("chat_token");
const savedUser = localStorage.getItem("chat_user");
if (savedToken && savedUser) {
  try {
    startChat(savedToken, JSON.parse(savedUser));
  } catch (err) {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_user");
  }
}

function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = "msg";
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  div.innerHTML = `<span class="sender">${escapeHtml(msg.senderName)}:</span> ${escapeHtml(
    msg.text
  )} <span class="time">${time}</span>`;
  messagesEl.appendChild(div);
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// --- Send message ---
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !socket) return;
  socket.emit("message:send", { room: ROOM, text });
  messageInput.value = "";
});

// --- Typing indicator (throttled emit) ---
let typingTimeout;
messageInput.addEventListener("input", () => {
  if (!socket) return;
  clearTimeout(typingTimeout);
  socket.emit("typing", ROOM);
  typingTimeout = setTimeout(() => {}, 1000);
});

// --- Logout ---
logoutBtn.addEventListener("click", () => {
  if (socket) socket.disconnect();
  localStorage.removeItem("chat_token");
  localStorage.removeItem("chat_user");
  currentUser = null;
  chatScreen.classList.add("hidden");
  authScreen.classList.remove("hidden");
  messagesEl.innerHTML = "";
});
