export class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }
}

const USER_KEY = "user";

export const session = {
  loggedIn: false,
  user: null,
};

export function login(user) {
  session.user = user;
  session.loggedIn = true;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout() {
  session.user = null;
  session.loggedIn = false;
  localStorage.removeItem(USER_KEY);
}

// Restore session from localStorage on load
const savedUser = localStorage.getItem(USER_KEY);
if (savedUser) {
  login(JSON.parse(savedUser));
}
