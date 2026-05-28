import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import { StoreModel } from "../models/store_model.js";

const CATEGORY_META = {
  eyes: { label: "Eyes", icon: "👁️" },
  mouth: { label: "Mouth", icon: "👄" },
  hair: { label: "Hair", icon: "💇" },
  skinColor: { label: "Skin Tone", icon: "🎨" },
  hairColor: { label: "Hair Color", icon: "🎭" },
  accessories: { label: "Accessories", icon: "✨" },
};

function avatarDataUri(options, size = 128) {
  return createAvatar(bigSmile, {
    ...options,
    backgroundColor: ["transparent"],
    size,
  }).toDataUri();
}

function equippedToOptions(equipped) {
  const opts = {
    eyes: [equipped.eyes],
    mouth: [equipped.mouth],
    hair: [equipped.hair],
    skinColor: [equipped.skinColor],
    hairColor: [equipped.hairColor],
    accessories: equipped.accessories || [],
    accessoriesProbability: (equipped.accessories || []).length > 0 ? 100 : 0,
    backgroundColor: ["transparent"],
  };
  return opts;
}

function itemThumbOptions(equipped, category, value) {
  const opts = equippedToOptions(equipped);
  if (category === "accessories") {
    if (value === "none") {
      opts.accessories = [];
      opts.accessoriesProbability = 0;
    } else {
      opts.accessories = [value];
      opts.accessoriesProbability = 100;
    }
  } else {
    opts[category] = [value];
  }
  return opts;
}

export class StoreView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    this.storeModel = new StoreModel(sessionModel);
    this.activeCategory = "eyes";
    const btn = document.querySelector("#btn-store");
    if (btn) btn.onclick = () => this.render();
  }

  render() {
    const equipped = this.storeModel.getEquipped();
    const coins = this.storeModel.getCoins();
    const catalog = this.storeModel.getCatalog();
    const purchased = this.storeModel.getPurchased();

    const previewSrc = avatarDataUri(equippedToOptions(equipped));

    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
      <div class="card rounded-4 shadow-sm border-0">
        <div class="p-4 border-bottom">
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="fw-bold mb-0">🛍️ Store</h3>
            <span class="badge bg-warning text-dark fs-6">🪙 <span id="store-coins">${coins}</span></span>
          </div>
        </div>
        <div class="text-center py-4 border-bottom" style="background:#f8f9fa;">
          <img id="store-avatar-preview" src="${previewSrc}"
               class="rounded-circle border" alt="Avatar preview"
               style="width:160px;height:160px;object-fit:cover;" />
        </div>
        <div class="p-3 border-bottom">
          <div class="d-flex flex-wrap gap-2 justify-content-center" id="store-categories">
            ${Object.entries(CATEGORY_META)
              .map(
                ([key, meta]) => `
              <button class="btn ${key === this.activeCategory ? "btn-primary" : "btn-outline-secondary"} btn-sm rounded-pill px-3" data-category="${key}">
                ${meta.icon} ${meta.label}
              </button>`,
              )
              .join("")}
          </div>
        </div>
        <div class="p-4" id="store-items-grid">
          ${this._renderItems()}
        </div>
      </div>`;

    this._wireEvents();
  }

  _isEquipped(item) {
    const equipped = this.storeModel.getEquipped();
    if (this.activeCategory === "accessories") {
      if (item.value === "none") return (equipped.accessories || []).length === 0;
      return (equipped.accessories || []).includes(item.value);
    }
    return equipped[this.activeCategory] === item.value;
  }

  _renderItems() {
    const catalog = this.storeModel.getCatalog();
    const items = catalog[this.activeCategory];
    const coins = this.storeModel.getCoins();
    const purchased = this.storeModel.getPurchased();
    const equipped = this.storeModel.getEquipped();
    const isColor =
      this.activeCategory === "skinColor" ||
      this.activeCategory === "hairColor";

    return `<div class="row g-3">${items
      .map((item) => {
        const owned = purchased.includes(item.id);
        const isEquipped = this._isEquipped(item);
        const canAfford = coins >= item.price;

        let actionHtml;
        if (isEquipped) {
          actionHtml = `<span class="badge bg-success">Equipped ✓</span>`;
        } else if (owned) {
          actionHtml = `<button class="btn btn-sm btn-primary" data-action="equip" data-item-id="${item.id}" data-category="${this.activeCategory}" data-value="${item.value}">Equip</button>`;
        } else if (item.price === 0) {
          actionHtml = `<button class="btn btn-sm btn-primary" data-action="equip" data-item-id="${item.id}" data-category="${this.activeCategory}" data-value="${item.value}">Free</button>`;
        } else if (canAfford) {
          actionHtml = `<button class="btn btn-sm btn-warning text-dark" data-action="buy" data-item-id="${item.id}">🪙 ${item.price}</button>`;
        } else {
          actionHtml = `<button class="btn btn-sm btn-outline-secondary" disabled>🪙 ${item.price}</button>`;
        }

        let thumbHtml;
        if (isColor) {
          thumbHtml = `<div class="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style="width:64px;height:64px;background:#${item.value};border:3px solid ${isEquipped ? "#198754" : "#dee2e6"};">
            ${isEquipped ? '<span class="text-white fw-bold" style="text-shadow:0 1px 2px rgba(0,0,0,.5);">✓</span>' : ""}
          </div>`;
        } else {
          const thumbSrc = avatarDataUri(
            itemThumbOptions(equipped, this.activeCategory, item.value),
            64,
          );
          const borderCls = isEquipped ? "border-success" : "";
          thumbHtml = `<img src="${thumbSrc}" class="rounded-circle mx-auto mb-2 ${borderCls}" alt="${item.name}" style="width:64px;height:64px;object-fit:cover;" />`;
        }

        const equippedBorder = isEquipped ? "border-success" : "";

        return `
          <div class="col-6 col-md-4 col-lg-3">
            <div class="card text-center p-3 h-100 ${equippedBorder}">
              ${thumbHtml}
              <span class="small fw-semibold d-block mb-2">${item.name}</span>
              ${actionHtml}
            </div>
          </div>`;
      })
      .join("")}</div>`;
  }

  _wireEvents() {
    const catBtns = document.querySelectorAll("#store-categories button");
    catBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeCategory = btn.dataset.category;
        const grid = document.querySelector("#store-items-grid");
        grid.innerHTML = this._renderItems();
        catBtns.forEach((b) => {
          b.classList.remove("btn-primary");
          b.classList.add("btn-outline-secondary");
        });
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-primary");
        this._wireItemEvents();
      });
    });

    this._wireItemEvents();
  }

  _wireItemEvents() {
    const grid = document.querySelector("#store-items-grid");
    if (!grid) return;

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.dataset.action;
      const itemId = btn.dataset.itemId;

      if (action === "buy") {
        const result = this.storeModel.purchase(itemId);
        if (result.ok) {
          const item = this.storeModel.getItemById(itemId);
          if (item) {
            const category = this.storeModel.getItemCategory(itemId);
            this.storeModel.equip(category, item.value);
          }
          this._notifyAvatarUpdate();
          this.render();
        } else {
          this._showToast(result.error);
        }
      } else if (action === "equip") {
        const category = btn.dataset.category;
        const value = btn.dataset.value;
        this.storeModel.equip(category, value);
        this._notifyAvatarUpdate();
        this.render();
      }
    });
  }

  _notifyAvatarUpdate() {
    const mainContainer = document.querySelector("#main-container");
    mainContainer.dispatchEvent(new CustomEvent("avatar:updated"));
  }

  _showToast(message) {
    const coinsEl = document.querySelector("#store-coins");
    if (!coinsEl) return;
    const originalText = coinsEl.textContent;
    const originalColor = coinsEl.style.color;
    coinsEl.textContent = message;
    coinsEl.style.color = "#dc3545";
    setTimeout(() => {
      coinsEl.textContent = this.storeModel.getCoins();
      coinsEl.style.color = originalColor;
    }, 2000);
  }
}