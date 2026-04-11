import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei";
import { SvgStringToImg } from "./utils.js";

const avatar = createAvatar(lorelei, { seed: "Lexis" });
const svg = avatar.toString();

const img = document.getElementById("avatar");
if (img) {
  img.src = SvgStringToImg(svg);
}

const welcomeText = document.getElementById("text-welcome");
if (1 != 1 /* user logged in */) {
  welcomeText.innerText = "Bem vindo, usuário! 👋";
}

const btnNormal = document.getElementById("btn-normal");
btnNormal.onclick = () => {
  alert("Clicked normal mode");
};
