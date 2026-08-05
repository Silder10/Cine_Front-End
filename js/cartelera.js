/* ==========================================================================
   UltraVision — cartelera.js
   Lógica exclusiva de pages/cartelera.html
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  cargarGeneros();
  cargarYPintar(); // carga inicial: populares, sin filtros
});

const form = document.getElementById("formFiltros");
form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  cargarYPintar();
});

/** Llena el <select> de géneros consultando la API */
async function cargarGeneros() {
  try {
    const generos = await getGenres();
    const select = document.getElementById("selectGenero");
    generos.forEach((genero) => {
      const opcion = document.createElement("option");
      opcion.value = genero.id;
      opcion.textContent = genero.name;
      select.appendChild(opcion);
    });
  } catch (error) {
    console.error("No se pudieron cargar los géneros:", error);
  }
}

/** Lee los filtros del formulario, consulta la API y pinta los resultados */
async function cargarYPintar() {
  const contenedor = document.getElementById("contenedorCartelera");
  const mensaje = document.getElementById("mensajeEstado");

  const texto = document.getElementById("inputBuscar").value.trim();
  const generoId = document.getElementById("selectGenero").value;
  const orden = document.getElementById("selectOrden").value;

  mensaje.textContent = "Cargando películas...";
  contenedor.innerHTML = "";

  try {
    let peliculas;

    if (texto) {
      peliculas = await searchMovies(texto);
    } else if (generoId) {
      peliculas = await getMoviesByGenre(generoId);
    } else {
      peliculas = await getPopularMovies();
    }

    peliculas = ordenarPeliculas(peliculas, orden);

    if (peliculas.length === 0) {
      mensaje.textContent = "No se encontraron resultados para tu búsqueda.";
      return;
    }

    mensaje.textContent = `${peliculas.length} resultados encontrados`;
    contenedor.innerHTML = peliculas.map((p) => tarjetaPeliculaHTML(p)).join("");
    activarBotonesFavorito(contenedor);
  } catch (error) {
    console.error(error);
    mensaje.textContent = "Ocurrió un error al consultar TMDb. Intenta de nuevo.";
  }
}

/** Ordena el arreglo de películas según el criterio elegido */
function ordenarPeliculas(peliculas, criterio) {
  const copia = [...peliculas];
  switch (criterio) {
    case "calificacion":
      return copia.sort((a, b) => b.vote_average - a.vote_average);
    case "reciente":
      return copia.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
    default:
      return copia.sort((a, b) => b.popularity - a.popularity);
  }
}