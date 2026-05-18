import { SessionModel } from "./models/session_model.js";
import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const sessionModel = new SessionModel();
const session = sessionModel.getSession();

console.log(session);
// if no session, create here anonymous

const avatar = createAvatar(bigSmile, {
  accessories: [],
  accessoriesProbability: 0,
  eyes: ["cheery"],
  hair: ["straightHair"],
  hairColor: ["238d80"],
  mouth: ["braces"],
  skinColor: ["a47539"],
  backgroundColor: ["transparent"],
  size: 128,
}).toDataUri();

document.getElementById("user-avatar").src = avatar;
console.log("should put avatar");
