import { Dispatcher } from "./dispatcher";
import { TweenMax, Power2, Power1, TimelineMax } from "gsap/TweenMax";
import lottie from "lottie-web";
import { Lethargy } from "../node_modules/lethargy/lethargy";
import { Utily as u } from "./utily";

export class SlideShow extends Dispatcher {
  constructor(sections, assets) {
    super(sections);

    this.slides = sections;
    this.total = this.slides.length - 1;
    this.current = -1;
    this.DIR_FORWARD = "forwards";
    this.DIR_BACKWARD = "backward";
    this.HOME_SECTION = "home";
    this.MOUSE_FRWD = -1;
    this.MOUSE_DWRD = 1;
    this.lastSlide = null;
    this.assets = assets;
    this.scrollMomentumSlower = new Lethargy();
    this.animations = {};
    this.animations.lottie = {};
    this.animations.main = {};
    this.timescale = 1;
    this.checkURL().then(this.init.bind(this));
  }

  init(location) {
    this.prepSlides().then(() => {
      this.createSectionTimelines().then(() => {
        this.setUpEventlisteners().then(() => {
          if (location.section !== this.HOME_SECTION) {
            setTimeout(() => {
              this.current = location.index;
              this.slideTo(this.current, this.DIR_FORWARD);
            }, 2000);
          }
        });
      });
    });
  }

  async prepSlides() {
    TweenMax.set(u.$$(".sections section"), {
      rotationY: -18,
      left: "130vw",
      scale: 0.8
    });
    TweenMax.set(u.$(".sections"), {
      css: {
        pointerEvents: "none"
      }
    });
    return true;
  }

  async createSectionTimelines() {
    for (let index = 0; index < this.slides.length; index++) {
      const slide = this.slides[index];
      const name = slide.dataset.section;

      const lottie = await this.getLottieTween(name);
      const tree = new TimelineMax({ paused: true });
      const h3 = u.$("." + name + " h3");
      const h2 = u.$("." + name + " h2");
      const subtitle = u.$("." + name + " .title p");
      const title_border = u.$("." + name + " .title");
      const p_first_letter = u.$("." + name + " .copy span.first-letter");
      const p_body_copy = u.$("." + name + " .copy span.body-copy");

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
      this.animations.main[slide.dataset.section] = tree;
      this.animations.lottie[slide.dataset.section] = lottie;
    }
    return true;
  }
  async getLottieTween(name) {
    let tmpAnim = await lottie.loadAnimation({
      wrapper: u.$("." + name + " .lottie"),
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData: this.assets.getResult(name),
      width: "100%",
      height: "100%"
    });

    return tmpAnim;
  }

  slideTo(index, direction) {
    let _tranition_TL = new TimelineMax();
    _tranition_TL.timeScale(this.timescale);
    if (index >= 0 && index <= this.total) {
      if (direction === this.DIR_FORWARD) {
        this.hideSlide(this.lastSlide, this.DIR_FORWARD).then(hide_response => {
          this.showSlide(this.slides[index]).then(show_response => {
            if (hide_response) {
              _tranition_TL.eventCallback(
                "onComplete",
                hide_response.handleOnComplete
              );

              _tranition_TL.add(hide_response.tl);
              _tranition_TL.add(show_response.tl, "-=0.1");
            } else {
              _tranition_TL.add(show_response.tl);
            }
          });
        });
        this.lastSlide = this.slides[index];
      } else if (direction === this.DIR_BACKWARD) {
        this.hideSlide(this.lastSlide, this.DIR_BACKWARD).then(
          hide_response => {
            this.showSlide(this.slides[index], this.DIR_BACKWARD).then(
              show_response => {
                _tranition_TL.eventCallback(
                  "onComplete",
                  show_response.handleOnComplete
                );
                _tranition_TL.add(hide_response.tl);
                _tranition_TL.add(show_response.tl, "-=0.6");
              }
            );
          }
        );
        this.lastSlide = this.slides[index];
      }
    } else {
      console.error("Index: " + index, this.total);
    }
  }

  async showSlide(slide, dir) {
    //console.log("+SHOW: ", slide);
    const tl = new TimelineMax();
    const sectionName = slide.dataset.section;
    const handleOnComplete = () => {
      if (dir === this.DIR_BACKWARD) {
        TweenMax.set(slide, {
          zIndex: 1
        });
      }
    };
    tl.timeScale(this.timescale);

    this.dispatch("slideState", {
      visible: true,
      section: sectionName
    });
    if (dir === this.DIR_BACKWARD) {
      TweenMax.set(slide, {
        z: -150,
        zIndex: 0,
        rotationY: 0,
        scale: 1,
        left: 0,
        visibility: "visible"
      });
    } else {
      tl.to(
        slide,
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
    }

    tl.to(slide, 0.65, { rotationY: 0, ease: Power1.easeOut }, "-=0.35");
    tl.to(
      slide,
      0.4,
      { rotationX: -15, scale: 1, ease: Power1.easeOut },
      "-=0.11"
    );
    tl.to(
      slide,
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
    return { tl, handleOnComplete };
  }

  async hideSlide(slide, dir) {
    if (!this.lastSlide) return false;
    //console.log("-HIDE: ", slide);
    const tl = new TimelineMax();
    const sectionName = slide.dataset.section;
    const handleOnComplete = () => {
      if (dir === this.DIR_FORWARD) {
        slide.style.visibility = "hidden";
        TweenMax.set(slide, {
          rotationZ: 0,
          rotationY: -18,
          left: "130vw",
          z: 0,
          scale: 0.8,
          zIndex: 0
        });
      }
    };
    tl.timeScale(this.timescale);
    this.animations.lottie[sectionName].pause();
    this.animations.lottie[sectionName].pause();
    this.dispatch("slideState", {
      visible: true,
      section: sectionName
    });
    tl.to(slide, 0.35, {
      rotationX: -15,
      ease: Power1.easeOut
    });

    tl.to(
      slide,
      0.4,
      {
        rotationX: 0,
        z: 20,
        scale: 0.8,
        ease: Power1.easeOut
      },
      "-=0.25"
    );
    if (dir === this.DIR_BACKWARD) {
      tl.to(slide, 0.2, { rotationZ: -3, ease: Power1.easeOut }, "-=0.15");
      tl.to(
        slide,
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
    } else {
      TweenMax.set(slide, {
        zIndex: 0
      });
    }

    return { tl, handleOnComplete };
  }

  handleNext() {
    this.isSectionAnimating().then(bool => {
      if (!bool) {
        this.current === this.total ? (this.current = 0) : (this.current += 1);
        this.slideTo(this.current, this.DIR_FORWARD);
        this.setHashURL();
      }
    });
  }

  handlePrev() {
    if (this.current < 0) return;
    this.isSectionAnimating().then(bool => {
      if (!bool) {
        this.current === 0 ? (this.current = this.total) : (this.current -= 1);
        this.slideTo(this.current, this.DIR_BACKWARD);
        this.setHashURL();
      }
    });
  }

  async isSectionAnimating() {
    let tweenFlag = false;
    for (let index = 0; index < this.slides.length; index++) {
      const slide = this.slides[index];
      if (TweenMax.isTweening(slide)) {
        tweenFlag = true;
      }
    }

    return tweenFlag;
  }

  async setUpEventlisteners() {
    document.addEventListener("wheel", this.handleWheel.bind(this));
    window.addEventListener("keydown", this.handleArrowKeys.bind(this), true);
    return true;
  }

  handleGoHome() {
    this.hideSlide(this.lastSlide, this.DIR_BACKWARD).then(hide_response => {
      this.current = -1;
      this.lastSlide = null;
      hide_response.tl.timeScale(0.8);
      hide_response.tl.play();
      location.hash = "";

      this.dispatch("slideState", {
        visible: false,
        section: "home"
      });
    });
  }

  gotoSection(sectionHash) {
    this.isSectionAnimating().then(bool => {
      if (!bool) {
        let name = sectionHash.split("#")[1];
        if (this.lastSlide) {
          if (this.lastSlide.className === name) return;
        }

        let slideIndex = this.getIndexFromName(name);
        this.current = slideIndex;
        this.setHashURL();
        this.slideTo(this.current, this.DIR_FORWARD);
      }
    });
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
        this.handleNext();
        break;
      case "Up":
      case "ArrowUp":
      case "Left":
      case "ArrowLeft":
        this.handlePrev();

        break;
    }
    event.preventDefault();
  }

  handleWheel(event) {
    if (!this.scrollMomentumSlower.check(event)) return;
    let scrollDelta = Math.sign(event.deltaY);
    if (scrollDelta === this.MOUSE_DWRD) {
      this.handleNext();
    } else if (scrollDelta === this.MOUSE_FRWD) {
      this.handlePrev();
    }
  }
  async checkURL() {
    if (window.location.hash) {
      let preposedSection = window.location.hash.split("#")[1].toLowerCase();
      //console.log("preposedSection ", preposedSection);
      let slideIndex = this.getIndexFromName(preposedSection);
      return { section: preposedSection, index: slideIndex };
    }
    return { section: this.HOME_SECTION };
  }

  getIndexFromName(name) {
    for (let index = 0; index < this.slides.length; index++) {
      const slide = this.slides[index];
      if (slide.className.toLowerCase() === name) {
        return index;
      }
    }
  }

  setHashURL() {
    const slide = this.slides[this.current];
    const slideName = slide.className;
    location.hash = slideName;
  }
}
