class title extends HTMLElement {
    connectedCallback() {
        this.render()
    }

    render() {
        this.innerHTML = `<h1><img src="https://www.freepnglogos.com/download/1428" alt="Pokemon-img"></h1>`
    }
}

customElements.define('pokemon-title', title)

const baseURL_pokedex = `https://pokeapi.co/api/v2/pokemon`

const colors = {
    fire: '#FEA7A7',
    grass: '#A9FCAF',
    electric: '#FCEC9B',
    water: '#ABE4FF',
    ground: '#FFD0A2',
    rock: '#C7C7C5',
    fairy: '#F8DEFF',
    poison: '#d6b3ff',
    bug: '#FDE9D1',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5',
    ice: '#e0f5ff ',
}

export const get_json = (url) => {
    return fetch(url).then((it) => it.json())
}

const search = (search_in, search_for) => {
    return search_in.toLowerCase().includes(search_for.toLowerCase())
}


class pokedex {
    constructor(baseURL_pokedex, show_pokemon = 30) {
        this.next_page = `${baseURL_pokedex}?limit=${show_pokemon}&offset=0`
        this.current_page = null
        this.prev_page = null
        this.cache = {}
    }

    get_loaded_pokemon = () => {
        return Object.values(this.cache).flat(1)
    }

    get_page = async (url) => {
        if (url in this.cache) {
            return this.cache[url]
        }

        const { results, next, previous } = await get_json(url)

        const pokemon_details = await Promise.all(
            results.map((it) => get_json(it.url))
        )

        this.current_page = url
        this.next_page = next
        this.prev_page = previous
        this.cache[url] = pokemon_details
        return pokemon_details
    }

    get_next_page = () => {
        if (!this.next_page) {
            console.warn('Estas en la ultima pagina', this.next_page)
            return []
        }
        return this.get_page(this.next_page)
    }

    search_by_name = (keyword) => {
        const all_pokemon = this.get_loaded_pokemon()
        if (!keyword.length) {
            return all_pokemon
        }

        return all_pokemon.filter((it) => search(it.name, keyword))
    }

    search_by_skill = (skill) => {
        const all_pokemon = this.get_loaded_pokemon()
        if (!skill.length) {
            return all_pokemon
        }

        //return all_pokemon.filter((it)=> search(it.abilities[0].ability.name, skill))
        return all_pokemon.filter((it) =>
            it.abilities.some((ability) => ability.ability.name === skill)
        )
    }
}


export {baseURL_pokedex, colors, title, pokedex}