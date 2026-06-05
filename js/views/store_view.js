import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import { StoreModel } from "../models/store_model.js";

const CATEGORY_ORDER = ["hair", "hairColor", "eyes", "mouth", "accessories", "backgroundColor"];
const CATEGORY_LABELS = {
  hair: "Hair", hairColor: "Hair Color", eyes: "Eyes",
  mouth: "Mouth", accessories: "Accessories", backgroundColor: "Background Color",
};

function avatarDataUri(options, size = 80) {
  return createAvatar(bigSmile, { ...options, size }).toDataUri();
}

function equippedToOptions(equipped) {
  return {
    eyes: [equipped.eyes], mouth: [equipped.mouth], hair: [equipped.hair],
    skinColor: [equipped.skinColor], hairColor: [equipped.hairColor],
    accessories: equipped.accessories || [],
    accessoriesProbability: (equipped.accessories || []).length > 0 ? 100 : 0,
    backgroundColor: equipped.backgroundColor ? [equipped.backgroundColor] : ["transparent"],
  };
}

function itemThumbOptions(equipped, category, value) {
  const opts = equippedToOptions(equipped);
  if (category === "accessories") {
    if (value === "none") { opts.accessories = []; opts.accessoriesProbability = 0; }
    else { opts.accessories = [value]; opts.accessoriesProbability = 100; }
  } else if (category === "backgroundColor") {
    opts.backgroundColor = [value];
  } else {
    opts[category] = [value];
  }
  return opts;
}

export class StoreView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    this.storeModel = new StoreModel(sessionModel);
    this.activeCategory = "hair";
    document.querySelectorAll('[data-tab="store"]').forEach((btn) => { btn.onclick = () => this.render(); });
  }

  _isEquipped(item) {
    const equipped = this.storeModel.getEquipped();
    if (this.activeCategory === "accessories") {
      if (item.value === "none") return (equipped.accessories || []).length === 0;
      return (equipped.accessories || []).includes(item.value);
    }
    if (this.activeCategory === "backgroundColor") return equipped.backgroundColor === item.value;
    return equipped[this.activeCategory] === item.value;
  }

  render() {
    if (window.setActiveTab) window.setActiveTab("store");
    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
      <div class="d-flex flex-column align-items-center py-4 w-100">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100 lexis-prompt-bar lexis-contained">
          You can buy things to customize your avatar with your in game coins here!
        </div>
        <div class="d-flex flex-wrap gap-2 justify-content-center mb-4" id="store-categories">
          ${CATEGORY_ORDER.map((key) => `
            <button class="btn btn-sm rounded-pill px-3 py-1 ${key === this.activeCategory ? "lexis-tab-active" : "lexis-tab-inactive"}" data-category="${key}">
              ${CATEGORY_LABELS[key]}
            </button>
          `).join("")}
        </div>
        <div class="d-flex flex-wrap gap-3 justify-content-center lexis-contained" id="store-items-grid">
          ${this._renderItems()}
        </div>
      </div>`;
    this._wireEvents();
  }

  _renderItems() {
    const catalog = this.storeModel.getCatalog();
    const items = catalog[this.activeCategory] || [];
    const purchased = this.storeModel.getPurchased();
    const equipped = this.storeModel.getEquipped();

    return items.map((item) => {
      const owned = purchased.includes(item.id);
      const isEquipped = this._isEquipped(item);
      const itemClass = isEquipped ? "lexis-item-equipped" : "lexis-item-card";

      let thumbHtml;
      if (this.activeCategory === "backgroundColor") {
        const color = item.value === "transparent" ? "var(--lexis-bg-card)" : `#${item.value}`;
        const border = item.value === "transparent" ? "2px dashed var(--lexis-border-dashed)" : "none";
        thumbHtml = `<div class="lexis-thumb-bg d-flex align-items-center justify-content-center mx-auto" style="background:${color};border:${border};">
          ${isEquipped ? '<span style="color:var(--lexis-primary);font-size:1.2rem;">✓</span>' : ""}</div>`;
      } else if (this.activeCategory === "skinColor" || this.activeCategory === "hairColor") {
        const dc = isEquipped ? "var(--lexis-primary)" : "var(--lexis-border)";
        thumbHtml = `<div class="lexis-thumb-circle d-flex align-items-center justify-content-center mx-auto" style="background:#${item.value};border:2px solid ${dc};"></div>`;
      } else {
        const src = avatarDataUri(itemThumbOptions(equipped, this.activeCategory, item.value), 70);
        const bs = isEquipped ? "3px solid var(--lexis-primary)" : "2px solid var(--lexis-border)";
        thumbHtml = `<img src="${src}" class="lexis-thumb-img mx-auto" alt="${item.name}" style="border:${bs};" />`;
      }

      const price = !owned ? `<div class="lexis-price-label py-1 px-2 text-center mt-2">${item.price > 0 ? item.price + " coins" : "Free"}</div>` : "";
      const ca = owned ? "" : `onclick="this.dispatchEvent(new CustomEvent('store:buy',{bubbles:true,detail:'${item.id}'}))"`;

      return `<div class="rounded-4 shadow-sm p-3 text-center ${itemClass} ${!owned ? "lexis-clickable" : ""}" ${ca}>${thumbHtml}${price}</div>`;
    }).join("");
  }

  _wireEvents() {
    document.querySelectorAll("#store-categories button").forEach((btn) => {
      btn.addEventListener("click", () => { this.activeCategory = btn.dataset.category; this.render(); });
    });
    document.querySelector("#store-items-grid")?.addEventListener("store:buy", (e) => {
      const r = this.storeModel.purchase(e.detail);
      if (r.ok) {
        const item = this.storeModel.getItemById(e.detail);
        if (item) this.storeModel.equip(this.storeModel.getItemCategory(e.detail), item.value);
        this._notifyAvatarUpdate();
        this.render();
      } else {
        const d = document.createElement("div");
        d.className = "alert alert-danger rounded-4 py-2 px-3 position-fixed";
        d.style.cssText = "top:1rem;right:1rem;z-index:9999;";
        d.textContent = r.error;
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 2000);
      }
    });
  }

  _notifyAvatarUpdate() { document.querySelector("#main-container").dispatchEvent(new CustomEvent("avatar:updated")); }
}
