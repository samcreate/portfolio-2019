import { Mouse } from "./mouse";
import { SlideShow } from "./slide-show";
import preloadjs from "preload-js";
import { TweenMax } from "gsap/TweenMax";

import lottie from "lottie-web";
var G = document.querySelectorAll(".lotties");

var MR = function(X) {
  return Math.random() * X;
};
var TwL = TweenLite;
function BTweens() {
  var W = window.innerWidth,
    H = window.innerHeight,
    C = 40;
  TwL.killDelayedCallsTo(BTweens);
  TwL.delayedCall(C * 1, BTweens);
  for (var i = G.length; i--; ) {
    var c = C,
      BA = [],
      GWidth = G[i].offsetWidth,
      GHeight = G[i].offsetHeight;
    while (c--) {
      var SO = MR(1);
      BA.push({
        opacity: MR(1.5),
        scale: MR(1.5),
        x: MR(W - GWidth),
        y: MR(H - GHeight),
        zIndex: Math.round(SO * 7)
      });
    }
    if (G[i].T) {
      G[i].T.kill();
    }
    G[i].T = TweenMax.to(G[i], C * 60, {
      bezier: { timeResolution: 0, type: "soft", values: BA },
      delay: i * 0.35,
      ease: Power4.easeOut
    });
  }
}
BTweens();
window.onresize = function() {
  TwL.killDelayedCallsTo(BTweens);
  TwL.delayedCall(0.4, BTweens);
};

for (var i = 0; i < G.length; i++) {
  console.log(G[i]);
  var temp_anim_data = {
    container: G[i],
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "https://assets7.lottiefiles.com/temp/lf20_5WNDZV.json"
  };
  lottie.loadAnimation(temp_anim_data);
}

class App {
  constructor() {
    this.$ = document.querySelector.bind(document);
    this.$$ = document.querySelectorAll.bind(document);
    this.mouse_ctrl = new Mouse();
    this.site_load().then(this.init.bind(this));
  }

  init() {
    this.slide_ctrl = new SlideShow(this.$$(".sections section"), this.queue);
    this.slide_ctrl.addListener("ready", e => console.log("e"));
    document.addEventListener(
      "wheel",
      this.slide_ctrl.handleWheel.bind(this.slide_ctrl)
    );
    window.addEventListener(
      "keydown",
      this.slide_ctrl.handleArrowKeys.bind(this.slide_ctrl),
      true
    );
  }

  onProgress(event) {
    this.progress = Math.round(event.loaded * 100);
    console.log("General progress", this.progress);
  }

  site_load() {
    this.queue = new preloadjs.LoadQueue();
    this.progress = 0;
    this.queue.on("progress", this.onProgress);
    return new Promise((resolve, reject) => {
      this.queue.on("complete", e => {
        resolve(e);
      });
      this.queue.loadManifest([
        {
          id: "tinker",
          src: "https://s3-us-west-2.amazonaws.com/lottietest/tinker.json"
        },
        {
          id: "explorer",
          src: "https://s3-us-west-2.amazonaws.com/lottietest/explorer.json"
        },
        {
          id: "developer",
          src: "https://s3-us-west-2.amazonaws.com/lottietest/developer.json"
        },
        {
          id: "animator",
          src: "https://s3-us-west-2.amazonaws.com/lottietest/animator.json"
        }
      ]);
    });
  }
}

const Portfolio = new App();
