import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import { StoreModel } from "../models/store_model.js";

const CATEGORY_ORDER = ["skinColor", "hair", "hairColor", "eyes", "mouth", "accessories", "backgroundColor"];
const CATEGORY_LABELS = {
  skinColor: "Skin Color", hair: "Hair", hairColor: "Hair Color", eyes: "Eyes",
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

export class CustomizationView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    this.storeModel = new StoreModel(sessionModel);
    this.activeCategory = "skinColor";
    document.querySelectorAll('[data-tab="customization"]').forEach((btn) => { btn.onclick = () => this.render(); });
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
    if (window.setActiveTab) window.setActiveTab("customization");
    const mc = document.querySelector("#main-container");
    mc.innerHTML = `
      <div class="d-flex flex-column align-items-center py-4 w-100">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100 lexis-prompt-bar lexis-contained">You can customize your avatar here!</div>
        <div class="d-flex flex-wrap gap-2 justify-content-center mb-4" id="custom-categories">
          ${CATEGORY_ORDER.map((k) => `
            <button class="btn btn-sm rounded-pill px-3 py-1 ${k === this.activeCategory ? "lexis-tab-active" : "lexis-tab-inactive"}" data-category="${k}">${CATEGORY_LABELS[k]}</button>
          `).join("")}
        </div>
        <div class="d-flex flex-wrap gap-3 justify-content-center lexis-contained" id="custom-items-grid">${this._renderItems()}</div>
      </div>`;
    this._wireEvents();
  }

  _renderItems() {
    const catalog = this.storeModel.getCatalog();
    const items = (catalog[this.activeCategory] || []).filter(i => this.storeModel.getPurchased().includes(i.id));
    const equipped = this.storeModel.getEquipped();
    if (!items.length) return '<p class="text-muted text-center py-3">No owned items in this category. Visit the store to purchase items.</p>';

    return items.map((item) => {
      const ie = this._isEquipped(item);
      const ic = ie ? "lexis-item-equipped" : "lexis-item-card";
      let thumb;
      if (this.activeCategory === "backgroundColor") {
        const c = item.value === "transparent" ? "var(--lexis-bg-card)" : `#${item.value}`;
        const b = item.value === "transparent" ? "2px dashed var(--lexis-border-dashed)" : "none";
        thumb = `<div class="lexis-thumb-bg d-flex align-items-center justify-content-center mx-auto" style="background:${c};border:${b};">${ie ? '<span style="color:var(--lexis-primary);font-size:1.2rem;">✓</span>' : ""}</div>`;
      } else if (this.activeCategory === "skinColor" || this.activeCategory === "hairColor") {
        const dc = ie ? "var(--lexis-primary)" : "var(--lexis-border)";
        thumb = `<div class="lexis-thumb-circle d-flex align-items-center justify-content-center mx-auto" style="background:#${item.value};border:2px solid ${dc};"></div>`;
      } else {
        const src = avatarDataUri(itemThumbOptions(equipped, this.activeCategory, item.value), 70);
        const bs = ie ? "3px solid var(--lexis-primary)" : "2px solid var(--lexis-border)";
        thumb = `<img src="${src}" class="lexis-thumb-img mx-auto" alt="${item.name}" style="border:${bs};" />`;
      }
      return `<div class="rounded-4 shadow-sm p-3 text-center ${ic} lexis-clickable" data-action="equip" data-category="${this.activeCategory}" data-value="${item.value}">${thumb}</div>`;
    }).join("");
  }

  _wireEvents() {
    document.querySelectorAll("#custom-categories button").forEach((btn) => {
      btn.addEventListener("click", () => { this.activeCategory = btn.dataset.category; this.render(); });
    });
    document.querySelector("#custom-items-grid")?.addEventListener("click", (e) => {
      const card = e.target.closest("[data-action='equip']");
      if (!card) return;
      this.storeModel.equip(card.dataset.category, card.dataset.value);
      document.querySelector("#main-container").dispatchEvent(new CustomEvent("avatar:updated"));
      this.render();
    });
  }
}
