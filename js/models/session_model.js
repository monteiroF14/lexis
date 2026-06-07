import { User } from "../user.js";

const USERS_KEY = "lexis_users";
const SESSION_KEY = "lexis_session";

export class SessionModel {
  #getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  }

  #saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  #saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  initSession() {
    if (!localStorage.getItem(SESSION_KEY)) this.startAnonymousSession();
  }

  startAnonymousSession() {
    const guest = new User({ id: crypto.randomUUID(), isAnonymous: true });
    this.#saveSession(guest);
    return guest;
  }

  getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  }

  logout() {
    this.startAnonymousSession();
  }

  login(identifier, password) {
    if (!identifier || !password)
      return { ok: false, error: "Fill in all fields." };
    const user = this.#getUsers().find(
      (u) =>
        (u.email === identifier || u.name === identifier) &&
        u.password === password,
    );
    if (!user) return { ok: false, error: "Invalid email or password." };
    this.#saveSession(user);
    return { ok: true, user };
  }

  createAccount({ name, email, password }) {
    if (!name || !email || !password)
      return { ok: false, error: "Fill in all fields." };
    const users = this.#getUsers();
    if (users.find((u) => u.email === email))
      return { ok: false, error: "Email already in use." };
    const newUser = new User({
      id: crypto.randomUUID(),
      name,
      email,
      password,
    });
    users.push(newUser);
    this.#saveUsers(users);
    this.#saveSession(newUser);
    return { ok: true, user: newUser };
  }

  updateUser(user) {
    this.#saveSession(user);
    if (!user.isAnonymous) {
      const users = this.#getUsers();
      const index = users.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
        this.#saveUsers(users);
      }
    }
  }

  recordDailyActivity() {
    const user = this.getSession();
    if (!user) return false;

    const today = new Date().toISOString().slice(0, 10);

    if (user.lastActiveDate === today) return false;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let isNewRecord = false;

    if (user.lastActiveDate === yesterday) {
      user.streak += 1;
      if (user.streak > (user.longestStreak || 0)) {
        user.longestStreak = user.streak;
        isNewRecord = true;
      }
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = today;
    this.updateUser(user);

    return { streak: user.streak, isNewRecord, isMilestone: user.streak > 0 && user.streak % 7 === 0 };
  }
}
