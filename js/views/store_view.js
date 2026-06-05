import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import { StoreModel } from "../models/store_model.js";

// Store categories: no skinColor since it's free
const CATEGORY_ORDER = ["hair", "hairColor", "eyes", "mouth", "accessories", "backgroundColor"];

const CATEGORY_LABELS = {
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

export class StoreView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    this.storeModel = new StoreModel(sessionModel);
    this.activeCategory = "hair";
    const btn = document.querySelector("#btn-store");
    if (btn) btn.onclick = () => this.render();
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
    const equipped = this.storeModel.getEquipped();

    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
      <div class="d-flex flex-column align-items-center py-4 w-100">
        <!-- Prompt bar -->
        <div class="bg-white rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100" style="max-width: 720px;">
          You can buy things to customize your avatar with your in game coins here!
        </div>

        <!-- Category tabs -->
        <div class="d-flex flex-wrap gap-2 justify-content-center mb-4" id="store-categories">
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
        <div class="d-flex flex-wrap gap-3 justify-content-center" id="store-items-grid" style="max-width: 720px;">
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

      let priceLabel = "";
      if (!owned && item.price > 0) {
        priceLabel = `<div class="rounded-pill py-1 px-2 text-center mt-2" style="background-color: #f97316; color: white; font-size: 0.75rem; font-weight: 500;">
          ${item.price} coins
        </div>`;
      } else if (!owned && item.price === 0) {
        priceLabel = `<div class="rounded-pill py-1 px-2 text-center mt-2" style="background-color: #f97316; color: white; font-size: 0.75rem; font-weight: 500;">
          Free
        </div>`;
      }

      const clickAction = owned
        ? ""
        : `onclick="this.dispatchEvent(new CustomEvent('store:buy',{bubbles:true,detail:'${item.id}'}))"`;

      return `
        <div class="bg-white rounded-4 shadow-sm p-3 text-center" style="width: 110px; ${cardBorder} cursor: ${owned ? 'default' : 'pointer'};"
             ${clickAction}>
          ${thumbHtml}
          ${priceLabel}
        </div>`;
    }).join("");
  }

  _wireEvents() {
    const catBtns = document.querySelectorAll("#store-categories button");
    catBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeCategory = btn.dataset.category;
        this.render();
      });
    });

    const grid = document.querySelector("#store-items-grid");
    if (grid) {
      grid.addEventListener("store:buy", (e) => {
        const itemId = e.detail;
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
          // Show error as a temporary alert
          const mainContainer = document.querySelector("#main-container");
          const errDiv = document.createElement("div");
          errDiv.className = "alert alert-danger rounded-4 py-2 px-3 position-fixed";
          errDiv.style.cssText = "top: 1rem; right: 1rem; z-index: 9999;";
          errDiv.textContent = result.error;
          document.body.appendChild(errDiv);
          setTimeout(() => errDiv.remove(), 2000);
        }
      });
    }
  }

  _notifyAvatarUpdate() {
    const mainContainer = document.querySelector("#main-container");
    mainContainer.dispatchEvent(new CustomEvent("avatar:updated"));
  }
}
