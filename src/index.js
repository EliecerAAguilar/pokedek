import 'regenerator-runtime';
import './styles/style.css';

/* eslint-disable require-jsdoc */
/* eslint-disable no-trailing-spaces */
class title extends HTMLElement {
  connectedCallback() {
    this.render();
  }
   
  // eslint-disable-next-line require-jsdoc
  render() {
    this.innerHTML = `<h1><img src="https://www.freepnglogos.com/download/1428" alt="Pokemon-img"></h1>`;
  }

}
   
customElements.define('pokemon-title', title);

const baseURL_pokedex = `https://pokeapi.co/api/v2/pokemon`;

const colors = {
  fire: "#FEA7A7",
  grass: "#A9FCAF",
  electric: "#FCEC9B",
  water: "#ABE4FF",
  ground: "#FFD0A2",
  rock: "#C7C7C5",
  fairy: "#F8DEFF",
  poison: "#d6b3ff",
  bug: "#FDE9D1",
  dragon: "#97b3e6",
  psychic: "#eaeda1",
  flying: "#F5F5F5",
  fighting: "#E6E0D4",
  normal: "#F5F5F5",
  ice: "#e0f5ff ",
};

/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */
// eslint-disable-next-line camelcase
const get_json = (url) => {
  return fetch(url)
      .then((it) => it.json());
};

// eslint-disable-next-line camelcase
const includes = (search_in, search_for) => {
  return search_in.toLowerCase()
      .includes(search_for.toLowerCase());
};

class pokedex {
  constructor(baseURL_pokedex, show_pokemon = 30) {
    this.next_page = `${baseURL_pokedex}?limit=${show_pokemon}&offset=0`;
    this.current_page = null;
    this.prev_page = null;
    this.cache = {};
  }

  get_loaded_pokemon = () => {
    return Object.values(this.cache).flat(1);
  };

  get_page = async (url) => {
    if (url in this.cache) {
      return this.cache[url];
    }

    const {results, next, previous} = await get_json(url);
    // eslint-disable-next-line max-len
    const pokemon_details = await Promise.all(results.map((it) => get_json(it.url)));

    this.current_page = url;
    this.next_page = next;
    this.prev_page = previous;
    this.cache[url] = pokemon_details;
    return pokemon_details;
  };

  get_next_page = () => {
    if (!this.next_page) {
      console.warn('Estas en la ultima pagina', this.next_page);
      return [];
    }
    return this.get_page(this.next_page);
  };

  search_by_name = (keyword) => {
    const all_pokemon = this.get_loaded_pokemon();
    if (!keyword.length) {
      return all_pokemon;
    }

    return all_pokemon.filter((it) => includes(it.name, keyword));
  };
}


const pokemon_container = document.querySelector(".pokemon_container");
const input_search = document.querySelector("#search_input");
const pokemon = new pokedex(baseURL_pokedex);

const load_next_page = async() => {
    const pokemons = await pokemon.get_next_page();
    pokemons.forEach(create_pokemon_container);
}

input_search.addEventListener("input", () => {
    pokemon_container.innerHTML = "";
    pokemon.search_by_name(input_search.value).forEach(create_pokemon_container);
});

window.addEventListener('load', load_next_page);
document.querySelector("#load_button").addEventListener("click", load_next_page);

const create_pokemon_container = pokemon => {
    const { name, weight } = pokemon;
    const id = pokemon.id.toString().padStart(3, "0");
    const type = pokemon.types[0].type.name;
    const skill = pokemon.abilities[0].ability.name;
    const pokemon_element = document.createElement("div");
    pokemon_element.classList.add("pokemon_box");
    pokemon_element.style.backgroundColor = colors[type];
    pokemon_element.innerHTML = pokemon_html(id, name, weight, type)
    pokemon_container.appendChild(pokemon_element);
}

const pokemon_html = (id, name, weight, type) => {
    return `
        <img
            class="pokemon_img"
            src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png"
            alt="${name} Pokemon"
        />
        <h3 class="pokemon_name">${name}</h3>
        <p class="pokemon_id"># ${id}</p>
        <p class="pokemon_weight">${weight} kg</p>
        <p class="pokemon_type">Type : ${type}</p>

    `
}

const disable_enter = (e) => {
    e = e || event;
    var txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
    return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
}

document.querySelector('#search_input').onkeypress = disable_enter;