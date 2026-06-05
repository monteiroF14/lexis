export class User {
  constructor({ id, name, email, password, isAnonymous = false }) {
    this.id = id;
    this.name = name ?? "Guest";
    this.email = email ?? null;
    this.password = password ?? null;
    this.isAnonymous = isAnonymous;
    this.xp = 0;
    this.coins = 0;
    this.solvedSheets = [];
    this.avatar = {};
    this.purchasedStoreItems = [];
    this.currentTitle = "Explorer";
    this.level = 1;
    this.theme = "light";
  }
}
