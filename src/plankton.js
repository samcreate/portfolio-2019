import { TweenMax, Power4 } from "gsap/TweenMax";
import lottie from "lottie-web";
import { Utily as u } from "./utily";
export default class Plankton {
  constructor(where, json_data, how_many) {
    const loc = u.$(where);
    for (let index = 0; index < how_many; index++) {
      let tmp_div = document.createElement("div");
      tmp_div.setAttribute("class", "life");
      lottie.loadAnimation({
        wrapper: tmp_div,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: json_data
      });

      loc.appendChild(tmp_div);
    }
    this.planktonLife = u.$$(".life");
    this.init_anim();
    window.onresize = this.handleResize.bind(this);
  }

  init_anim() {
    let W = window.innerWidth,
      H = window.innerHeight,
      C = 10;
    TweenMax.killDelayedCallsTo(this.init_anim.bind(this));
    TweenMax.delayedCall(C * 1, this.init_anim.bind(this));
    for (var i = this.planktonLife.length; i--; ) {
      var c = C,
        animBunch = [],
        GWidth = this.planktonLife[i].offsetWidth,
        GHeight = this.planktonLife[i].offsetHeight;
      while (c--) {
        animBunch.push({
          x: u.MR(W - GWidth),
          y: u.MR(H - GHeight)
        });
      }
      if (this.planktonLife[i].T) {
        this.planktonLife[i].T.kill();
      }
      this.planktonLife[i].T = TweenMax.to(this.planktonLife[i], C * 60, {
        bezier: { timeResolution: 0, type: "soft", values: animBunch },
        delay: i * u.MR(0.35),
        ease: Power4.easeOut
      });
    }
  }

  handleResize() {
    TweenMax.killDelayedCallsTo(this.init_anim.bind(this));
    TweenMax.delayedCall(u.MR(0.9), this.init_anim.bind(this));
  }
}
