import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { session } from "./session.js";

if (!session.loggedIn) {
  console.log("not logged in");
}
