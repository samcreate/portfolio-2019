import { Dispatcher } from "./dispatcher";
import { TweenMax, Power2, Power1, TimelineMax } from "gsap/TweenMax";
import lottie from "lottie-web";
import { Lethargy } from "../node_modules/lethargy/lethargy";

export class SlideShow extends Dispatcher {
  constructor(sections, assets) {
    super(sections);

    this.$ = document.querySelector.bind(document);
    this.$$ = document.querySelectorAll.bind(document);

    this.assets = assets;
    this.loaded = 0;
    this.animations = {};
    this.animations.lottie = {};
    this.animations.main = {};
    this.lethargy = new Lethargy();
    this.sections = sections;
    this.pastIndex = 1;
    this.currentSectionIndex = 1;
    this.upward = -1;
    this.downward = 1;
    this.firstRun = true;
    this.isTweenBool = false;

    TweenMax.set(document.querySelectorAll(".sections section.hidden"), {
      rotationY: -18,
      left: "130vw",
      scale: 0.8
    });

    sections.forEach(slide => {
      this.createMainSectionTimeline(slide.dataset.section).then(response => {
        this.loaded++;
        this.animations.main[slide.dataset.section] = response.tl;
        this.animations.lottie[slide.dataset.section] = response.lottie;
        if (this.loaded === sections.length) {
          this.dispatch("ready", {
            loaded: true
          });
        }
      });
    });
  }

  checkSlideState() {
    this.isTweenBool = false;

    this.sections.forEach($sect => {
      if (TweenMax.isTweening($sect)) {
        this.isTweenBool = true;
      }
    });

    if (this.currentSectionIndex > this.sections.length) {
      this.currentSectionIndex = 1;
    }
    if (this.currentSectionIndex < 1) {
      this.currentSectionIndex = this.sections.length;
    }
    if (this.pastIndex < 1) {
      this.pastIndex = this.sections.length;
    }

    if (this.pastIndex > this.sections.length) {
      this.pastIndex = 1;
    }
  }

  handleArrowKeys(event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        this.checkSlideState();
        this.next();
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
      case "Left": // IE/Edge specific value
      case "ArrowLeft":
        this.checkSlideState();
        this.prev();
        // Do something for "up arrow" key press.
        break;
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  }

  handleWheel(event) {
    if (!this.lethargy.check(event)) return;
    let scrollDelta = Math.sign(event.deltaY);

    this.checkSlideState();

    if (!this.isTweenBool && scrollDelta === this.downward) {
      this.next();
    } else if (!this.isTweenBool && scrollDelta === this.upward) {
      this.prev();
    }
  }

  next() {
    this.firstRun = false;
    let tl = new TimelineMax();
    let sectionToShow = this.sections[this.currentSectionIndex - 1];
    let sectionToHide = this.sections[this.pastIndex - 1];
    let sectionName = sectionToShow.dataset.section;
    let sectionToHideName = sectionToHide.dataset.section;

    this.animations.lottie[sectionToHideName].pause();
    this.animations.lottie[sectionName].pause();

    tl.to(sectionToHide, 0.3, {
      z: -150,
      ease: Power1.easeOut,
      zIndex: 0,
      onComplete: function() {
        setTimeout(() => {
          TweenMax.set(this.target, {
            rotationY: -18,
            left: "130vw",
            scale: 0.8,
            visibility: "hidden"
          });
        }, 300);
      }
    });
    tl.to(
      sectionToShow,
      0.4,
      {
        left: 0,
        ease: Power1.easeOut,
        z: 20,
        zIndex: 1,
        visibility: "visible"
      },
      "-=0.15"
    );
    tl.to(
      sectionToShow,
      0.65,
      { rotationY: 0, ease: Power1.easeOut },
      "-=0.35"
    );
    tl.to(
      sectionToShow,
      0.4,
      { rotationX: -15, scale: 1, ease: Power1.easeOut },
      "-=0.11"
    );
    tl.to(
      sectionToShow,
      0.35,
      {
        rotationX: 0,
        rotationZ: 0,
        z: 0,
        ease: Power1.easeOut,
        onComplete: () => {
          this.animations.main[sectionName].resume();
          this.animations.lottie[sectionName].play();
        }
      },
      "-=0.35"
    );
    this.pastIndex = this.currentSectionIndex;
    this.currentSectionIndex++;
  }

  prev() {
    if (this.firstRun) return;
    this.pastIndex--;
    this.currentSectionIndex--;

    let tl = new TimelineMax();

    if (this.currentSectionIndex === 0) {
      this.urrentSectionIndex = this.sections.length;
    }
    if (this.pastIndex === 0) {
      this.pastIndex = this.sections.length;
    }

    let sectionToShow = this.sections[this.pastIndex - 1];
    let sectionToHide = this.sections[this.currentSectionIndex - 1];
    let sectionName = sectionToShow.dataset.section;
    let sectionToHideName = sectionToHide.dataset.section;
    if (this.currentSectionIndex !== 1) {
      tl.set(sectionToShow, {
        z: -150,
        ease: Power1.easeOut,
        zIndex: 0,
        rotationY: 0,
        scale: 1,
        left: 0,
        visibility: "visible"
      });
    } else {
      this.firstRun = true;
    }

    this.animations.lottie[sectionName].pause();
    this.animations.lottie[sectionToHideName].pause();
    tl.to(sectionToHide, 0.35, {
      rotationX: -15,
      ease: Power1.easeOut
    });

    tl.to(
      sectionToHide,
      0.4,
      { rotationX: 0, z: 20, scale: 0.8, ease: Power1.easeOut },
      "-=0.25"
    );
    tl.to(
      sectionToHide,
      0.2,
      { rotationZ: -3, ease: Power1.easeOut },
      "-=0.15"
    );
    tl.to(
      sectionToHide,
      0.4,
      {
        rotationZ: 0,
        rotationY: -18,
        left: "130vw",
        z: 0,
        scale: 0.8,
        ease: Power1.easeOut,
        onComplete: function() {
          TweenMax.set(this.target, { visibility: "hidden" });
        }
      },
      "-=0.15"
    );
    if (this.currentSectionIndex !== 1) {
      tl.to(
        sectionToShow,
        0.4,
        { rotationX: -15, scale: 1, ease: Power1.easeOut },
        "-=0.11"
      );
      tl.to(
        sectionToShow,
        0.35,
        {
          rotationX: 0,
          rotationZ: 0,
          z: 0,
          ease: Power1.easeOut,
          onComplete: () => {
            this.animations.lottie[sectionName].play();
            this.animations.main[sectionName].play();
          }
        },
        "-=0.35"
      );
    }
  }

  createMainSectionTimeline(name) {
    return new Promise((resolve, reject) => {
      var tree = new TimelineMax({ paused: true });
      let h3 = this.$("." + name + " h3");
      let h2 = this.$("." + name + " h2");
      let subtitle = this.$("." + name + " .title p");
      let title_border = this.$("." + name + " .title");
      let p_first_letter = this.$("." + name + " .copy span.first-letter");
      let p_body_copy = this.$("." + name + " .copy span.body-copy");
      TweenMax.set(h3, { y: "+=" + h3.clientHeight / 2 + "px" });
      TweenMax.set([h2, subtitle, p_first_letter, p_body_copy], {
        opacity: 0,
        y: "+=20px",
        ease: Power2.easeOut
      });
      this.getLottieTween(name).then(lottie => {
        tree.to(h3, 1, { opacity: 1, y: 0, ease: Power1.easeOut });
        tree.call(
          () => {
            lottie.play();
          },
          null,
          null,
          "-=1"
        );
        tree.staggerTo(
          [h2, subtitle],
          0.93,
          { autoAlpha: 1, y: "-=20px", ease: Power2.easeOut },
          0.08,
          "-=0.5"
        );
        tree.fromTo(
          title_border,
          0.25,
          { borderRightColor: "rgba(0,0,0,0)" },
          { borderRightColor: "rgba(0,0,0,1)" },
          "-=0.8"
        );
        tree.staggerTo(
          [p_first_letter, p_body_copy],
          0.93,
          { autoAlpha: 1, y: "-=20px", ease: Power2.easeOut },
          0.08,
          "-=0.8"
        );
        resolve({ tl: tree, lottie });
      });
    });
  }
  getLottieTween(name) {
    let promise = new Promise((resolve, reject) => {
      let tmpAnim = lottie.loadAnimation({
        wrapper: this.$("." + name + " .lottie"),
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: this.assets.getResult(name),
        width: "100%",
        height: "100%"
      });
      resolve(tmpAnim);
    });

    return promise;
  }
}
