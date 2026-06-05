import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import { StoreModel } from "../models/store_model.js";

// Customization categories: includes skinColor (free) and backgroundColor
const CATEGORY_ORDER = ["skinColor", "hair", "hairColor", "eyes", "mouth", "accessories", "backgroundColor"];

const CATEGORY_LABELS = {
  skinColor: "Skin Color",
  hair: "Hair",
  hairColor: "Hair Color",
  eyes: "Eyes",
  mouth: "Mouth",
  accessories: "Accessories",
  backgroundColor: "Background Color",
};

function avatarDataUri(options, size = 80) {
  return createAvatar(bigSmile, {
    ...options,
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
    backgroundColor: equipped.backgroundColor ? [equipped.backgroundColor] : ["transparent"],
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
    document.querySelectorAll('[data-tab="customization"]').forEach(btn => {
      btn.onclick = () => this.render();
    });
  }

  _isEquipped(item) {
    const equipped = this.storeModel.getEquipped();
    if (this.activeCategory === "accessories") {
      if (item.value === "none") return (equipped.accessories || []).length === 0;
      return (equipped.accessories || []).includes(item.value);
    }
    if (this.activeCategory === "backgroundColor") {
      return equipped.backgroundColor === item.value;
    }
    return equipped[this.activeCategory] === item.value;
  }

  render() {
    if (window.setActiveTab) window.setActiveTab("customization");
    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
      <div class="d-flex flex-column align-items-center py-4 w-100">
        <!-- Prompt bar -->
        <div class="bg-white rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100" style="max-width: 720px;">
          You can customize your avatar here!
        </div>

        <!-- Category tabs -->
        <div class="d-flex flex-wrap gap-2 justify-content-center mb-4" id="custom-categories">
          ${CATEGORY_ORDER.map((key) => `
            <button class="btn btn-sm rounded-pill px-3 py-1" data-category="${key}"
                    style="${key === this.activeCategory
                      ? 'background-color: #4f46e5; color: white; border: none;'
                      : 'background-color: white; color: #374151; border: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'}">
              ${CATEGORY_LABELS[key]}
            </button>
          `).join("")}
        </div>

        <!-- Items grid -->
        <div class="d-flex flex-wrap gap-3 justify-content-center" id="custom-items-grid" style="max-width: 720px;">
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

    const ownedItems = items.filter((item) => purchased.includes(item.id));

    if (ownedItems.length === 0) {
      return '<p class="text-muted text-center py-3">No owned items in this category. Visit the store to purchase items.</p>';
    }

    return ownedItems.map((item) => {
      const isEquipped = this._isEquipped(item);

      let thumbHtml;
      if (this.activeCategory === "backgroundColor") {
        const color = item.value === "transparent" ? "white" : `#${item.value}`;
        const border = item.value === "transparent" ? "2px dashed #d1d5db" : "none";
        thumbHtml = `<div class="rounded-3 d-flex align-items-center justify-content-center mx-auto"
                          style="width:70px;height:70px;background:${color};border:${border};">
          ${isEquipped ? '<span style="color:#4f46e5;font-size:1.2rem;">✓</span>' : ""}
        </div>`;
      } else if (this.activeCategory === "skinColor" || this.activeCategory === "hairColor") {
        thumbHtml = `<div class="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                          style="width:70px;height:70px;background:#${item.value};border:2px solid ${isEquipped ? '#4f46e5' : '#e5e7eb'};">
        </div>`;
      } else {
        const thumbSrc = avatarDataUri(
          itemThumbOptions(equipped, this.activeCategory, item.value),
          70,
        );
        const borderStyle = isEquipped ? "3px solid #4f46e5" : "2px solid #e5e7eb";
        thumbHtml = `<img src="${thumbSrc}" class="rounded-3 mx-auto" alt="${item.name}"
                          style="width:70px;height:70px;object-fit:cover;border:${borderStyle};" />`;
      }

      const cardBorder = isEquipped ? "border: 2px solid #4f46e5;" : "border: none;";
      const cardBg = isEquipped ? "background-color: #4f46e5;" : "background-color: white;";

      return `
        <div class="rounded-4 shadow-sm p-3 text-center" style="width: 110px; ${cardBg} ${cardBorder}; cursor: pointer;"
             data-action="equip" data-category="${this.activeCategory}" data-value="${item.value}">
          ${thumbHtml}
        </div>`;
    }).join("");
  }

  _wireEvents() {
    const catBtns = document.querySelectorAll("#custom-categories button");
    catBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeCategory = btn.dataset.category;
        this.render();
      });
    });

    const grid = document.querySelector("#custom-items-grid");
    if (!grid) return;

    grid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-action='equip']");
      if (!card) return;

      const category = card.dataset.category;
      const value = card.dataset.value;
      this.storeModel.equip(category, value);

      const mainContainer = document.querySelector("#main-container");
      mainContainer.dispatchEvent(new CustomEvent("avatar:updated"));

      this.render();
    });
  }
}
