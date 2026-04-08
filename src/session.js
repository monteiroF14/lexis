export class Session {
  #isValid = false;
  get isValid() {
    return this.#isValid;
  }

  #user;
  get user() {
    return this.#user;
  }
}

export class User {
  #username;
  #email;
  #password;

  User(username, email, password) {
    this.#username = username;
    this.#email = email;
    this.#password = password;
  }
}

export const session = Session.CreateSession();
