import { SessionModel } from "./models/session_model.js";

const sessionModel = new SessionModel();
const session = sessionModel.getSession();

console.log(session);
if (!session) {
  window.location.href = "index.html";
}

if (session.isAnonymous) {
  // dar render só a algumas coisas
}
