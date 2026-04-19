//Obtenemos los elementos de la interfaz
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const app = document.getElementById('app');
const paginationInfo = document.getElementById('pagination-info');

// Función reutilizable para fetch con manejo de errores
async function fetchJSON(url) {
  const res = await fetch(url);
  // Control de status HTTP
  if (!res.ok) {
    // Intentamos leer el body como texto por si trae info
    const body = await res.text().catch(() => '');
    throw new Error(
      `HTTP ${res.status} - ${res.statusText} ${body ? '| ' + body : ''}`
    );
  }
  // Parse JSON
  return res.json();
}

//Obtener el listado de pokemons
async function getPokemons(url = 'https://pokeapi.co/api/v2/pokemon/?limit=10') {
    const data = await fetchJSON(url);
    nextBtn.dataset.url = data.next ?? '';
    prevBtn.dataset.url = data.previous ?? '';
    updatePaginationButtons(data.previous, data.next);
    return data;
}

//Obtiene el detalle de un pokemos concreto a partir desu id o nombre
async function getPokemonDetail(nameOrId) {
    try {
        const data = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${nameOrId}/`);
        return data;
    } catch (error) {
        return new Error(`Error obteniendo el detalle del pokemon: ${error.message}`);
    }
}

//Funcionalidad del botón de búsqueda,que sólo debe mostrar una tarjeta de pokemon
searchBtn.addEventListener('click', async () => {
    const nameOrId = searchInput.value.trim().toLowerCase();
    if (!nameOrId) {
        alert('Es necesario poner un nombre o ID de Pokémon.');
        return;
    }else {
        try {
            const pokemon = await getPokemonDetail(nameOrId);
            if (pokemon instanceof Error) {
                throw pokemon; // Lanzamos el error para que lo maneje el catch
            }

            app.innerHTML = '';
            app.classList.add('single-result');
            const card = createPokemonCard(pokemon);
            app.appendChild(card);
            paginationInfo.textContent = `Mostrando resultado para "${nameOrId}"`;
        } catch (error) {
            app.innerHTML = `<p class="error">Pokemon no encontrado</p>`;
        }
    }
});

//Funcionalidad de los botones de paginación
nextBtn.addEventListener('click', () => renderPokemons(nextBtn.dataset.url));
prevBtn.addEventListener('click', () => renderPokemons(prevBtn.dataset.url));

// Funcionalidad del botón de reset
resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    app.innerHTML = '';
    //Inicializamos la página
    init();
});

//Función que dibuja una tarjeta de Pokemon
const createPokemonCard = (pokemon) => {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    const img = document.createElement('img');
    img.src = pokemon.sprites.other['official-artwork'].front_default;
    img.alt = pokemon.name;

    const name = document.createElement('h3');
    name.textContent = pokemon.name;

    card.appendChild(img);
    card.appendChild(name);
    return card;
}

//Función para mostrar deshabilitados o no los botones de anterior y siguiente
const updatePaginationButtons = (prevUrl, nextUrl) => {
    prevBtn.disabled = !prevUrl;
    nextBtn.disabled = !nextUrl;
}

//Renderiza una página de pokemons a partir de una URL
const renderPokemons = async (url) => {
    try {
        app.innerHTML = '';
        app.classList.remove('single-result');
        paginationInfo.textContent = 'Cargando...';
        const data = await getPokemons(url);
        const params = new URLSearchParams(new URL(url || 'https://pokeapi.co/api/v2/pokemon/?offset=0').search);
        const offset = parseInt(params.get('offset') || '0');
        paginationInfo.textContent = `Pokémons ${offset + 1} a ${offset + data.results.length} de ${data.count}`;
        data.results.forEach(async (pokemon) => {
            const detail = await getPokemonDetail(pokemon.name);
            app.appendChild(createPokemonCard(detail));
        });
    } catch (error) {
        app.innerHTML = `<p class="error">Error al cargar los pokemons</p>`;
    }
}

const init = () => renderPokemons();

// Inicializamos la aplicación
init();