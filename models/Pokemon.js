export default class Pokemon {
    constructor({
        name,
        image_src,
        primary_type,
        secondary_type = null,
        generation,
        color,
        height,
        weight
    }) {
        this.name = name;
        this.image_src = image_src;
        this.primary_type = primary_type;
        this.secondary_type = secondary_type;
        this.generation = generation;
        this.color = color;
        this.height = height;
        this.weight = weight;
    }
}