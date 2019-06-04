import { Mouse } from "./mouse";
import { SlideShow } from "./slide-show";
import preloadjs from "preload-js";
import { TimelineMax, TweenMax, Power1, Power2, Elastic } from "gsap/TweenMax";
import lottie from "lottie-web";
import loaderJson from "./json/loader.json";
import Plankton from "./plankton";
import { Utily as u } from "./utily";
import Mobile from "./mobile";
import Click from "./click";

class App {
  constructor() {
    this.loader_anim = {};
    this.mouse_ctrl = new Mouse();
    this.site_load().then(this.init.bind(this));
  }

  init() {
    this.plankton_ctrl = new Plankton(
      ".plankton",
      this.queue.getResult("plankton"),
      u.isMobile() ? 1 : 2
    );

    const tl = new TimelineMax();
    const h1 = u.$(".about h1");
    const p = u.$(".about p");
    const icons = u.$$(".about li");
    const image = u.$(".about .image-container");
    const bg = u.$(".bg");
    const plankton = u.$$(".plankton .life");
    const homeButton = u.$("li.home");
    const dots = u.$$("li.dot a");
    const nav = u.$("nav");
    const scrollIndicator = u.$(".scroll-icon-container");
    tl.timeScale(0.9);

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

    this.dotCycleTween = new TimelineMax();
    this.dotCycleTween.timeScale(1.2);
    this.dotCycleTween.staggerTo(
      dots,
      1,
      {
        cycle: {
          //an array of values
          backgroundColor: [
            "rgb(241,103,100)",
            "rgb(141,236,193)",
            "rgb(70,114,141)",
            "#502455"
          ]
        },
        repeat: -1,
        repeatDelay: 1,
        yoyo: true,
        ease: Power2.easeOut
      },
      0.6
    );

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
    tl.to(nav, 0.5, {
      opacity: 1,
      ease: Power1.easeOut
    });
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
      { autoAlpha: 1, y: "-=20px", ease: Power2.easeOut },
      0.06,
      "-=0.90"
    );

    tl.to(
      scrollIndicator,
      0.5,
      {
        autoAlpha: 1
      },
      "-=1.5"
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
    tl.staggerFromTo(
      plankton,
      1,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, ease: Elastic.easeOut.config(1, 0.5) },
      5,
      "-=0.0"
    );

    this.click_ctrl = new Click(u.$$("a"));
    if (u.isMobile()) {
      this.mobile = new Mobile(u.$$(".sections section"), this.queue);
      u.$("#app").classList.add("is-mobile");
    } else {
      this.slide_ctrl = new SlideShow(u.$$(".sections section"), this.queue);

      this.slide_ctrl.addListener("slideState", e => {
        if (e.visible) {
          u.$("#app").classList.add("about-tilt-off");
          u.$(".plankton").style.opacity = 0;
          TweenMax.to(scrollIndicator, 0.5, { opacity: 0 });
          u.$(".home").classList.add("visible");
          u.$("#app").className = e.section;
          this.dotCycleTween.pause(0);
        } else {
          u.$("#app").classList.remove("about-tilt-off");
          u.$(".plankton").style.opacity = 1;
          //u.$(".scroll-indicator-container").style.visibility = "visible";
          u.$("#app").className = "";
          u.$(".home").classList.remove("visible");
          this.dotCycleTween.resume(0);
        }

        this.plankton_ctrl.pause(e.visible);
      });

      homeButton.addEventListener(
        "click",
        e => {
          e.preventDefault();
          this.slide_ctrl.handleGoHome();
        },
        true
      );
    }
  }

  onProgress(event) {
    this.progress = Math.round(event.loaded * 100);
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
