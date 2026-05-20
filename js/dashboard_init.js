import { SessionModel } from "./models/session_model.js";
import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
<<<<<<< HEAD
=======
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { DashboardModel } from "./models/dashboard_model.js";
import { LevelsView } from "./views/levels_view.js";
import { PdfView } from "./views/pdf_view.js";
import { CustomizationView } from "./views/customization_view.js";
import { StoreView } from "./views/store_view.js";
import { SettingsView } from "./views/settings_view.js";
>>>>>>> f7399d7 (add views for main tabs of dashboard)

const sessionModel = new SessionModel();
const session = sessionModel.getSession();

console.log(session);

const avatar = createAvatar(bigSmile, {
  accessories: [],
  accessoriesProbability: 0,
  eyes: ["cheery"],
  hair: ["straightHair"],
  hairColor: ["238d80"],
  mouth: ["braces"],
  skinColor: ["a47539"],
  backgroundColor: ["transparent"],
});

<<<<<<< HEAD
const svg = avatar.toString();
document.getElementById("user-avatar").src = svg;
=======
document.querySelector("#user-avatar").src = avatar;

const dashboardModel = new DashboardModel();
const levelsView = new LevelsView(dashboardModel);
const pdfView = new PdfView(dashboardModel);
const customizationView = new CustomizationView(dashboardModel);
const storeView = new StoreView(dashboardModel);
const settingsView = new SettingsView(dashboardModel);
levelsView.render();
>>>>>>> f7399d7 (add views for main tabs of dashboard)
