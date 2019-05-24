import React from "react";
import { Component } from "react";
import pf from "petfinder-client";
import Carousel from "./Carousel";

const petFinder = pf({
  key: process.env.API_KEY,
  secret: process.env.API_SECRET
});
export default class Details extends Component {
  state = {
    loading: true
  };

  componentDidMount() {
    petFinder.pet
      .get({
        output: "full",
        id: this.props.id
      })
      .then(pet => {
        let breed = pet.petfinder.pet.breeds.breed;
        let { name, animal, description, media } = pet.petfinder.pet;
        if (Array.isArray(pet.petfinder.pet.breeds.breed)) {
          breed = pet.petfinder.pet.breeds.breed.join(", ");
        }

        this.setState({
          name,
          animal,
          description,
          media,
          breed,
          location: `${pet.petfinder.pet.contact.city}, ${
            pet.petfinder.pet.contact.state
          }`,
          loading: false
        });
      })
      .catch(error => {
        this.setState({ error });
      });
  }

  render() {
    if (this.state.loading) {
      return <h1>Loading</h1>;
    }
    const { name, animal, description, media, breed, location } = this.state;
    return (
      <div className="details">
        <Carousel media={media} />
        <h1>{name}</h1>
        <p>
          {animal} - {breed} - {location}
        </p>
        <p>{description}</p>
      </div>
    );
  }
}
