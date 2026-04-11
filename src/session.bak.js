export const session = {
  loggedIn: false,
  user: null,
};

const USER_KEY = "user";
const LOGGED_IN_KEY = "loggedIn";

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  session.user = user;

  localStorage.setItem(LOGGED_IN_KEY, true);
  session.loggedIn = true;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  session.user = null;

  localStorage.removeItem(LOGGED_IN_KEY);
  session.loggedIn = false;
}

if (localStorage.getItem(LOGGED_IN_KEY)) {
  let user_json = localStorage.getItem(USER_KEY);
  let user = JSON.parse(user_json);
  setUser(user);
}

export class User {
  constructor(name, email, password) {
    this.username = name;
    this.email = email;
    this.password = password;
  }
}
export const defaultUsers = [new User("admin", "admin@admin", "admin")];
localStorage.setItem("users", JSON.stringify(defaultUsers));
