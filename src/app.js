import 'regenerator-runtime';
import './styles/style.css';
import { baseURL_pokedex, colors, title, pokedex, get_json} from './script/utils';
import { async } from 'regenerator-runtime';


const pokemon_container = document.querySelector(".pokemon_container");
const input_search = document.querySelector("#search_input");
const searchByAbility = document.querySelector("#search_skill");
const pokemon = new pokedex(baseURL_pokedex);

const load_next_page = async() => {
    const pokemons = await pokemon.get_next_page();
    pokemons.forEach(create_pokemon_container);
}

// search box by names
input_search.addEventListener("input", () => {
    pokemon_container.innerHTML = "";
    pokemon.search_by_name(input_search.value).forEach(create_pokemon_container);
});

window.addEventListener('load', load_next_page);
document.querySelector("#load_button").addEventListener("click", load_next_page);

// search box by abilities
searchByAbility.addEventListener("input", () => {
    pokemon_container.innerHTML = "";
    pokemon.search_by_skill(searchByAbility.value).forEach(create_pokemon_container);
});


const get_evolution_chain = async (id_str = 5) => {
    const ID = parseInt(id_str,10).toString();
    const evolutionEndpoint = `https://pokeapi.co/api/v2/evolution-chain/${ID}/`;
    const evolutionChain = await get_json(evolutionEndpoint);
    const evolutionChainArray = [];

    // Obtener el nombre del Pokémon inicial
    const initialPokemon = evolutionChain.chain.species.name;
    evolutionChainArray.push(initialPokemon);

    // Obtener las evoluciones
    const evolvesTo = evolutionChain.chain.evolves_to;
    if (evolvesTo.length > 0) {
        const firstEvolution = evolvesTo[0].species.name;
        evolutionChainArray.push(firstEvolution);

        // Obtener las siguientes evoluciones si existen
        const secondEvolvesTo = evolvesTo[0].evolves_to;
        if (secondEvolvesTo.length > 0) {
            const secondEvolution = secondEvolvesTo[0].species.name;
            evolutionChainArray.push(secondEvolution);
        }
    }
    return evolutionChainArray;

  }

const create_pokemon_container = pokemon => {
    const { name, weight } = pokemon;
    const id = pokemon.id.toString().padStart(3, "0");
    const type = pokemon.types[0].type.name;
    const skills = pokemon.abilities.map((ability) => ability.ability.name)

    let evolutions = []
    get_evolution_chain(id)
    .then((response) => evolutions = response )
    .finally(() => {
        const pokemon_element = document.createElement("div");
        pokemon_element.classList.add("pokemon_box");
        pokemon_element.style.backgroundColor = colors[type];
        pokemon_element.innerHTML = pokemon_html(id, name, weight, type,evolutions,skills)
        pokemon_container.appendChild(pokemon_element);
    })
}

const pokemon_html = (id, name, weight, type, evolutionChain,skills) => {
    return `
        <img
            class="pokemon_img"
            src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png"
            alt="${name} Pokemon"
        />
        <h3 class="pokemon_name">${name}</h3>
        <p class="pokemon_id">ID: ${id}</p>
        <p class="pokemon_weight">Peso: ${weight} kg</p>
        <p class="pokemon_type">Tipo: ${type}</p>
        <p class="pokemon_skill">Habilidades : ${skills}</p>
        <p class="pokemon_skill">Evoluciones : ${evolutionChain}</p>


    `
}

const disable_enter = (e) => {
    e = e || event;
    var txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
    return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
}

document.querySelector('#search_input').onkeypress = disable_enter;