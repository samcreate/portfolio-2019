import { Mouse } from "./mouse";
import { SlideShow } from "./slide-show";
import preloadjs from "preload-js";
import { TimelineMax, TweenMax, Power1, Power2 } from "gsap/TweenMax";
import lottie from "lottie-web";
import loaderJson from "./json/loader.json";

class App {
  constructor() {
    this.$ = document.querySelector.bind(document);
    this.$$ = document.querySelectorAll.bind(document);
    this.loader_anim = {};
    this.mouse_ctrl = new Mouse();
    this.site_load().then(this.init.bind(this));
  }

  init() {
    let tl = new TimelineMax();
    let h1 = this.$(".about h1");
    let p = this.$(".about p");
    let icons = this.$$(".about li");
    let image = this.$(".about .image-container");
    let bg = this.$(".bg");
    tl.set([h1, p, icons], {
      autoAlpha: 0,
      y: "+=20px"
    });
    tl.set([bg], {
      autoAlpha: 0
    });
    tl.set([image], {
      opacity: 0
    });
    this.$("#app").classList.remove("loading");
    tl.to(this.loaderEl, 1, {
      autoAlpha: 0,
      ease: Power1.easeOut
    });
    tl.to(
      bg,
      0.7,
      {
        autoAlpha: 1,
        ease: Power1.easeOut
      },
      "-=0.4"
    );
    tl.staggerTo(
      [h1, p],
      0.93,
      { autoAlpha: 1, y: "-=20px", ease: Power2.easeOut },
      0.08,
      "-=0.4"
    );
    tl.staggerTo(
      icons,
      0.5,
      { autoAlpha: 1, y: "-=20px", ease: Power2.easeOut },
      0.04,
      "-=0.50"
    );
    tl.to(
      image,
      0.5,
      {
        opacity: 1
      },
      "-=0.8"
    );

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

    // this.plankton_ctrl = new Plankton(
    //   ".plankton",
    //   this.queue.getResult("plankton"),
    //   1
    // );
  }

  onProgress(event) {
    this.progress = Math.round(event.loaded * 100);
    console.log("General progress", this.progress);
    document.body.style.setProperty("--loaded", 100 - this.progress + "%");
  }

  site_load() {
    this.loaderEl = this.$(".loader");
    document.body.style.setProperty("--loaded", "100%");
    this.loader_anim.font = lottie.loadAnimation({
      wrapper: this.$(".bt-ldr"),
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: loaderJson,
      width: "100%",
      height: "100%"
    });
    this.loader_anim.back = lottie.loadAnimation({
      wrapper: this.$(".tp-ldr"),
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: loaderJson,
      width: "100%",
      height: "100%"
    });
    this.queue = new preloadjs.LoadQueue();
    this.progress = 0;
    this.queue.on("progress", this.onProgress);

    TweenMax.fromTo(
      this.loaderEl,
      1,
      { y: "+=40px", opacity: 0 },
      { y: "-=40px", opacity: 1, ease: Power1.easeOut }
    );

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
        },
        {
          id: "plankton",
          src: "https://s3-us-west-2.amazonaws.com/lottietest/plankton.json"
        }
      ]);
    });
  }
}

const Portfolio = new App();
