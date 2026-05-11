import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei";
import { SvgStringToImg } from "./utils.js";
import { session } from "./session.js";
import { Worksheet } from "./worksheet.js";

const avatar = createAvatar(lorelei, { seed: Math.random() });
const svg = avatar.toString();

const img = document.getElementById("avatar");
if (img) {
  img.src = SvgStringToImg(svg);
}

const welcomeText = document.getElementById("text-welcome");
if (session.loggedIn) {
  welcomeText.innerText = `Bem vindo, ${session.user.username}! 👋`;
}

const btnNormal = document.getElementById("btn-normal");
btnNormal.onclick = () => {
  new Worksheet();
};
