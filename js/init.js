import { LoginView } from "./views/login_view.js";
import { CreateAccountView } from "./views/create_account_view.js";
import { SessionModel } from "./models/session_model.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const sessionModel = new SessionModel();
sessionModel.initSession();

// Apply saved dark-mode preference from session user
const savedUser = sessionModel.getSession();
const savedTheme = (savedUser && savedUser.theme) || "light";
document.documentElement.setAttribute("data-bs-theme", savedTheme);

const loginView = new LoginView(sessionModel);
const createAccountView = new CreateAccountView(sessionModel);
document
  .getElementById("main-container")
  .addEventListener("index:render", () => {
    loginView.attachTrigger();
    createAccountView.attachTrigger();
  });
