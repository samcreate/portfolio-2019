export class Mouse {
  constructor() {
    this.paused = false;
    this.x = 0;
    this.y = 0;
    this.currX = 0;
    this.currY = 0;
    document.addEventListener("mousemove", event => {
      if (this.paused) return;
      let e = event.touches ? event.touches[0] : event;
      this.x = e.clientX;
      this.y = e.clientY;
    });
    this.update();
    //document.body.style.cursor = "none";
  }

  pause(bl) {
    this.paused = bl;
  }
  update() {
    requestAnimationFrame(() => {
      this.currX = this.currX + (this.x - this.currX) * 0.15;
      this.currY = this.currY + (this.y - this.currY) * 0.15;
      const { innerWidth, innerHeight } = window;
      const rotX = (this.currY / innerHeight) * -2 + 1;
      const rotY = (this.currX / innerWidth) * 2 - 1;

      document.body.style.setProperty("--rot-x", rotX);
      document.body.style.setProperty("--rot-xvw", rotY + "vw");
      document.body.style.setProperty("--rot-yvw", rotX + "vw");
      document.body.style.setProperty("--rot-y", rotY);

      console.log();

      this.update();
    });
  }
}
