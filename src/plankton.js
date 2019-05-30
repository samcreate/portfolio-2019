import { TweenMax, Power2 } from "gsap/TweenMax";
import lottie from "lottie-web";
import { Utily as u } from "./utily";
export default class Plankton {
  constructor(where, json_data, how_many) {
    const loc = u.$(where);
    lottie.setQuality("low");
    this.plankton = [];
    this.paused = false;

    for (let index = 0; index < how_many; index++) {
      let tmp_div = document.createElement("div");
      tmp_div.setAttribute("class", "life");

      let _tmp_anim = lottie.loadAnimation({
        wrapper: tmp_div,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: json_data
      });
      this.plankton.push(_tmp_anim);
      TweenMax.set(tmp_div, {
        x: u.MR(window.innerWidth),
        y: u.MR(window.innerHeight)
      });
      let frame = Math.floor(u.MR(100));
      setTimeout(() => {
        _tmp_anim.goToAndPlay(frame, true);
      }, frame);

      loc.appendChild(tmp_div);
    }
    this.planktonLife = u.$$(".life");
    this.init_anim();
    window.onresize = this.handleResize.bind(this);
  }

  init_anim() {
    let W = window.innerWidth,
      H = window.innerHeight,
      C = 20;
    TweenMax.killDelayedCallsTo(this.init_anim.bind(this));
    TweenMax.delayedCall(C * 1, this.init_anim.bind(this));
    for (var i = this.planktonLife.length; i--; ) {
      var c = C,
        animBunch = [],
        GWidth = this.planktonLife[i].offsetWidth / 2,
        GHeight = this.planktonLife[i].offsetHeight / 2;
      while (c--) {
        animBunch.push({
          x: u.MR(W - GWidth),
          y: u.MR(H - GHeight)
        });
      }
      if (this.planktonLife[i].T) {
        this.planktonLife[i].T.kill();
      }
      this.planktonLife[i].T = TweenMax.to(this.planktonLife[i], C * 120, {
        bezier: { timeResolution: 0, type: "soft", values: animBunch },
        delay: i * u.MR(0.8),
        ease: Power2.easeOut
      });
    }
  }

  handleResize() {
    TweenMax.killDelayedCallsTo(this.init_anim.bind(this));
    TweenMax.delayedCall(u.MR(0.9), this.init_anim.bind(this));
  }

  pause(bool) {
    if (bool === this.paused) return;
    this.plankton.forEach(plank => {
      if (bool) {
        plank.pause();
      } else {
        plank.play();
      }
      this.paused = bool;
    });
  }
}
