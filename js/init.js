import { IndexModel } from "./models/index_model.js";
import { LoginView } from "./views/login_view.js";
import { CreateAccountView } from "./views/create_account_view.js";
import { SessionModel } from "./models/session_model.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const sessionModel = new SessionModel();
const model = new IndexModel(sessionModel); // single shared instance
sessionModel.initSession();

const loginView = new LoginView(model);
const createAccountView = new CreateAccountView(model);
document
  .getElementById("main-container")
  .addEventListener("index:render", () => {
    loginView.attachTrigger();
    createAccountView.attachTrigger();
  });
