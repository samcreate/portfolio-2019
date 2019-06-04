import { Dispatcher } from "./dispatcher";
import { TweenMax, Power2, Power1, TimelineMax } from "gsap/TweenMax";
import lottie from "lottie-web";
import { Lethargy } from "../node_modules/lethargy/lethargy";
import CSSRulePlugin from "gsap/CSSRulePlugin";
import { Utily as u } from "./utily";

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
    this.sectionGradientOpacity = 0.0;
    this.currentSectionName;

    TweenMax.set(this.$$(".sections section.hidden"), {
      rotationY: -18,
      left: "130vw",
      scale: 0.8
    });
    TweenMax.set(this.$(".sections"), {
      css: {
        pointerEvents: "none"
      }
    });

    sections.forEach(slide => {
      try {
        this.createMainSectionTimeline(slide.dataset.section).then(response => {
          this.loaded++;
          this.animations.main[slide.dataset.section] = response.tl;
          this.animations.lottie[slide.dataset.section] = response.lottie;
          if (this.loaded === sections.length) {
            // this.dispatch("ready", {
            //   loaded: true
            // });
          }
        });
      } catch (error) {
        console.error(
          "Unabled to create main timeline: ",
          slide.dataset.section
        );
      }
    });

    this.setUpEventlisteners();
  }

  setUpEventlisteners() {
    document.addEventListener("wheel", this.handleWheel.bind(this));
    window.addEventListener("keydown", this.handleArrowKeys.bind(this), true);
  }

  handleGoHome() {
    this.firstRun = true;

    const tl = new TimelineMax();

    const sectionToHide = u.$("section." + this.currentSectionName);
    const ruleForHide = CSSRulePlugin.getRule(
      "#app .sections section." + this.currentSectionName + "::before"
    );

    this.hideSlideAnim(tl, sectionToHide, ruleForHide);

    this.dispatch("slideState", {
      visible: false,
      section: this.currentSectionName
    });

    this.pastIndex = 1;
    this.currentSectionIndex = 1;
  }

  handleArrowKeys(event) {
    if (event.defaultPrevented) {
      return;
    }

    switch (event.key) {
      case "Down":
      case "ArrowDown":
      case "Right":
      case "ArrowRight":
        this.checkSlideState();
        this.next();
        break;
      case "Up":
      case "ArrowUp":
      case "Left":
      case "ArrowLeft":
        this.checkSlideState();
        this.prev();

        break;
    }
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

  next() {
    this.firstRun = false;
    const tl = new TimelineMax();
    tl.timeScale(0.95);

    const sectionToShow = this.sections[this.currentSectionIndex - 1];
    const sectionToHide = this.sections[this.pastIndex - 1];
    const sectionName = sectionToShow.dataset.section;
    const sectionToHideName = sectionToHide.dataset.section;
    const ruleForHide = CSSRulePlugin.getRule(
      "#app .sections section." + sectionToHideName + "::before"
    );
    const ruleForShow = CSSRulePlugin.getRule(
      "#app .sections section." + sectionName + "::before"
    );

    this.animations.lottie[sectionToHideName].pause();
    this.animations.lottie[sectionName].pause();

    TweenMax.to(
      ruleForShow,
      0,
      { cssRule: { opacity: this.sectionGradientOpacity } },
      0
    );

    if (sectionName !== sectionToHideName) {
      tl.to(sectionToHide, 0.3, {
        z: -150,
        ease: Power1.easeOut,
        zIndex: 0,
        onComplete: () => {
          setTimeout(() => {
            TweenMax.set(sectionToHide, {
              rotationY: -18,
              left: "130vw",
              scale: 0.8,
              visibility: "hidden"
            });
          }, 300);
        }
      });
      tl.to(
        ruleForHide,
        0.3,
        { cssRule: { opacity: this.sectionGradientOpacity } },
        0
      );
    }
    this.currentSectionName = sectionName;
    this.dispatch("slideState", {
      visible: true,
      section: sectionName
    });
    tl.to(
      sectionToShow,
      0.4,
      {
        left: 0,
        ease: Power1.easeOut,
        z: 20,
        zIndex: 1,
        visibility: "visible",
        onComplete: () => {
          TweenMax.to(ruleForShow, 1, { cssRule: { opacity: 0 } });
        }
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
    tl.timeScale(0.95);

    if (this.pastIndex === 0) {
      this.pastIndex = this.sections.length;
    }

    if (this.currentSectionIndex === 0) {
      this.currentSectionIndex = this.sections.length;
    }

    let sectionToShow = this.sections[this.pastIndex - 1];
    let sectionToHide = this.sections[this.currentSectionIndex - 1];
    let sectionName = sectionToShow.dataset.section;
    let sectionToHideName = sectionToHide.dataset.section;
    let ruleForHide = CSSRulePlugin.getRule(
      "#app .sections section." + sectionToHideName + "::before"
    );
    let ruleForShow = CSSRulePlugin.getRule(
      "#app .sections section." + sectionName + "::before"
    );
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

      TweenMax.to(ruleForShow, 0, {
        cssRule: { opacity: this.sectionGradientOpacity }
      });
    } else {
      this.firstRun = true;
    }

    this.animations.lottie[sectionName].pause();
    this.animations.lottie[sectionToHideName].pause();
    this.dispatch("slideState", {
      visible: true,
      section: sectionName
    });
    this.currentSectionName = sectionName;

    this.hideSlideAnim(tl, sectionToHide, ruleForHide);
    if (this.currentSectionIndex !== 1) {
      tl.to(
        sectionToShow,
        0.4,
        {
          rotationX: -15,
          scale: 1,
          ease: Power1.easeOut
        },
        "-=0.11"
      );
      tl.to(
        ruleForShow,
        0.3,
        {
          cssRule: { opacity: 0 }
        },
        "-=0.4"
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
    } else {
      this.dispatch("slideState", {
        visible: false,
        section: sectionName
      });
    }
  }

  hideSlideAnim(tl, sectionToHide, ruleForHide) {
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
      ruleForHide,
      0.4,
      {
        cssRule: { opacity: this.sectionGradientOpacity }
      },
      "-=0.4"
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
  }

  async createMainSectionTimeline(name) {
    const lottie = await this.getLottieTween(name);
    const tree = new TimelineMax({ paused: true });

    const h3 = this.$("." + name + " h3");
    const h2 = this.$("." + name + " h2");
    const subtitle = this.$("." + name + " .title p");
    const title_border = this.$("." + name + " .title");
    const p_first_letter = this.$("." + name + " .copy span.first-letter");
    const p_body_copy = this.$("." + name + " .copy span.body-copy");
    TweenMax.set(h3, { y: "+=" + h3.clientHeight / 2 + "px" });
    TweenMax.set([h2, subtitle, p_first_letter, p_body_copy], {
      opacity: 0,
      y: "+=20px",
      ease: Power2.easeOut
    });

    tree.to(h3, 1, { opacity: 1, y: 0, ease: Power1.easeOut });
    tree.call(
      () => {
        lottie.play();
      },
      null,
      null,
      "-=0.9"
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
    return { tl: tree, lottie };
  }
  async getLottieTween(name) {
    let tmpAnim = await lottie.loadAnimation({
      wrapper: this.$("." + name + " .lottie"),
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData: this.assets.getResult(name),
      width: "100%",
      height: "100%"
    });

    return tmpAnim;
  }
}
