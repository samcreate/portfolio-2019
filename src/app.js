import { Mouse } from "./mouse";
import { SlideShow } from "./slide-show";
import preloadjs from "preload-js";
import { TweenMax } from "gsap/TweenMax";

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
