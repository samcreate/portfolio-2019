import React, { Component } from "react";

export default class Carousel extends Component {
  state = {
    photos: [],
    active: 0
  };

  static getDerivedStateFromProps({ media }) {
    let photos = [];

    if (media && media.photos && media.photos.photo) {
      photos = media.photos.photo.filter(photo => photo["@size"] === "pn");
    }
    return { photos };
  }

  handelIndexClick = event => {
    this.setState({
      active: +event.target.dataset.index
    });
  };

  render() {
    const { photos, active } = this.state;
    return (
      <div className="carousel">
        <img src={photos[active].value} alt="primary animal" />
        <div className="carousel-smaller">
          {photos.map((photo, i) => (
            /* eslint-disable-next-line */
            <img
              onClick={this.handelIndexClick}
              key={photo.value}
              src={photo.value}
              data-index={i}
              className={i === active ? "active" : ""}
              alt="animal"
            />
          ))}
        </div>
      </div>
    );
  }
}
