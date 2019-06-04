import clickJson from "./json/click.json";
import lottie from "lottie-web";
import { Utily as u } from "./utily";
export default class Click {
  constructor(links) {
    this.padding = 150;
    links.forEach(link => {
      link.addEventListener(
        "click",
        e => {
          e.preventDefault();
          e.target.disabled = "true";

          let width = e.target.offsetWidth + this.padding;
          let height = width / 3 - width;
          let container = document.createElement("div");
          container.className = "click-confetti";
          u.$("#confetti-holder").appendChild(container);

          document.body.style.setProperty("--click-width", width + "px");
          document.body.style.setProperty("--click-height", height + "px");

          document.body.style.setProperty("--click-x", e.clientX + "px");
          document.body.style.setProperty("--click-y", e.clientY + "px");

          let tmpAnim = lottie.loadAnimation({
            wrapper: container,
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: clickJson,
            width: "100%",
            height: "100%"
          });
          tmpAnim.setSpeed(1);

          tmpAnim.addEventListener("complete", () => {
            setTimeout(() => {
              if (e.target.hasAttribute("target")) {
                window.open(e.target.href);
                tmpAnim.destroy();
                if (u.isMobile()) {
                  document.location.href = e.target.href;
                }
              } else {
                document.location.href = e.target.href;
              }
            }, 50);
          });

          tmpAnim.play();
          return false;
        },
        true
      );
    });
  }
}
