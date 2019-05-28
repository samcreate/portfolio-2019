import { Mouse } from "./mouse";
import { SlideShow } from "./slide-show";
import preloadjs from "preload-js";
import { TimelineMax, TweenMax, Power1, Power2 } from "gsap/TweenMax";
import lottie from "lottie-web";
import loaderJson from "./json/loader.json";
import Plankton from "./plankton";
import { Utily as u } from "./utily";
class App {
  constructor() {
    this.loader_anim = {};
    this.mouse_ctrl = new Mouse();
    this.site_load().then(this.init.bind(this));
  }

  init() {
    let tl = new TimelineMax();
    let h1 = u.$(".about h1");
    let p = u.$(".about p");
    let icons = u.$$(".about li");
    let image = u.$(".about .image-container");
    let bg = u.$(".bg");
    let plankton = u.$$(".plankton");
    let scrollIndicator = u.$(".scroll-indicator");
    tl.set([h1, p, image], {
      autoAlpha: 0,
      y: "+=20px"
    });
    tl.set([icons], {
      autoAlpha: 0,
      y: "+=60px"
    });
    tl.set([bg], {
      autoAlpha: 0
    });

    u.$("#app").classList.remove("loading");
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
      0.8,
      { autoAlpha: 1, y: "-=40px", ease: Power2.easeOut },
      0.06,
      "-=0.90"
    );
    tl.to(
      image,
      0.5,
      {
        autoAlpha: 1,
        y: "-=20px"
      },
      "-=1.5"
    );
    tl.to(
      plankton,
      1,
      {
        autoAlpha: 1,
        y: "-=20px"
      },
      "-=1.6"
    );
    tl.to(
      scrollIndicator,
      0.5,
      {
        autoAlpha: 1,
        x: "+=20",
        repeat: -1,
        yoyo: true,
        ease: Power1.easeOut
      },
      "-=1"
    );

    this.plankton_ctrl = new Plankton(
      ".plankton",
      this.queue.getResult("plankton"),
      3
    );
    this.slide_ctrl = new SlideShow(u.$$(".sections section"), this.queue);
    this.slide_ctrl.addListener("ready", e => console.log("e"));
    this.slide_ctrl.addListener("slideState", e => {
      if (e.visible) {
        u.$("#app").classList.add("about-tilt-off");
        u.$(".plankton").style.visibility = "hidden";
        u.$(".scroll-indicator-container").style.visibility = "hidden";
      } else {
        u.$("#app").classList.remove("about-tilt-off");
        u.$(".plankton").style.visibility = "visible";
        u.$(".scroll-indicator-container").style.visibility = "visible";
      }

      this.plankton_ctrl.pause(e.visible);
    });

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
    document.body.style.setProperty("--loaded", 100 - this.progress + "%");
  }

  site_load() {
    this.loaderEl = u.$(".loader");
    document.body.style.setProperty("--loaded", "100%");
    this.loader_anim.font = lottie.loadAnimation({
      wrapper: u.$(".bt-ldr"),
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: loaderJson,
      width: "100%",
      height: "100%"
    });
    this.loader_anim.back = lottie.loadAnimation({
      wrapper: u.$(".tp-ldr"),
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
