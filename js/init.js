import { LoginView } from "./views/login_view.js";
import { CreateAccountView } from "./views/create_account_view.js";
import { IndexModel } from "./models/index_model.js";
// arrancar as viiews; o HTML importa este ficheiro como module
//
const loginView = new LoginView();
const createAccountView = new CreateAccountView();
const indexModel = new IndexModel();
