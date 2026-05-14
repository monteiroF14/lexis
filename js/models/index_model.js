export class IndexModel {
  #sessionModel;

  constructor(sessionModel) {
    this.#sessionModel = sessionModel;
  }

  login(email, password) {
    return this.#sessionModel.login(email, password);
  }

  createAccount({ name, email, password }) {
    return this.#sessionModel.createAccount({
      name: name,
      email: email,
      password: password,
    });
  }
}
