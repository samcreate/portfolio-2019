import lottie from "lottie-web";
import { Utily as u } from "./utily";
import { TweenMax, Power1, TimelineMax } from "gsap/TweenMax";

export default class Mobile {
  constructor(sections, assets) {
    this.assets = assets;
    this.lotties = {};
    this.observers = [];
    this.textAnimations = {};

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1
    };

    sections.forEach((slide, i) => {
      try {
        slide.classList.add("is-mobile");

        this.observers[i] = new IntersectionObserver(
          this.handleObservable.bind(this),
          observerOptions
        );
        this.getLottieTween(slide.dataset.section).then(res => {
          this.lotties[slide.dataset.section] = res;
        });

        this.getAnimation(slide.dataset.section).then(res => {
          this.textAnimations[slide.dataset.section] = res;
        });
        this.observers[i].observe(slide);
      } catch (error) {
        console.error("Unabled to create lotties: ", slide.dataset.section);
      }
    });
  }

  handleObservable(e) {
    let check = e[0];
    if (check.isIntersecting) {
      let target = check.target;
      let sectionName = target.dataset.section;

      this.lotties[sectionName].play(0);
      this.textAnimations[sectionName].play(0);
    } else {
      this.lotties[check.target.dataset.section].stop();
      this.textAnimations[check.target.dataset.section].reverse(0);
    }
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

  async getAnimation(name) {
    const tl = new TimelineMax({ paused: true });
    const h3 = u.$("." + name + " h3");
    const h2 = u.$("." + name + " h2");
    const subtitle = u.$("." + name + " .title p");
    const p_first_letter = u.$("." + name + " .copy span.first-letter");
    const p_body_copy = u.$("." + name + " .copy span.body-copy");
    const title_border = u.$("." + name + " .title");
    const allObj = [
      [title_border, subtitle, h2],
      h3,
      [p_first_letter, p_body_copy]
    ];

    TweenMax.set(allObj, {
      opacity: 0,
      y: "+=10px",
      transformStyle: "preserve-3d"
    });
    tl.staggerTo(
      allObj,
      0.8,
      { opacity: 1, y: "-=10px", ease: Power1.easeOut, delay: 0.5 },
      0.3
    );
    return tl;
  }
}
