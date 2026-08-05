/* ==========================================================================
   UltraVision — app.js
   Lógica general del sitio (se ejecuta en todas las páginas).
   La página index.html usa initHome() para pintar carrusel + populares.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initModoOscuro();

  const enIndex = document.getElementById("carruselInner");
  if (enIndex) {
    initHome();
  }
});

/* ==========================================================================
   Modo oscuro / claro (funcionalidad global, disponible en todas las páginas)
   ========================================================================== */
function initModoOscuro() {
  const boton = document.getElementById("toggleTema");
  if (!boton) return;

  const temaGuardado = localStorage.getItem("uv-theme");
  if (temaGuardado === "light") {
    document.body.classList.add("light-mode");
    boton.textContent = "☀️";
  } else {
    boton.textContent = "🌙";
  }

  boton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const esClaro = document.body.classList.contains("light-mode");
    boton.textContent = esClaro ? "☀️" : "🌙";
    localStorage.setItem("uv-theme", esClaro ? "light" : "dark");
  });
}

/* ==========================================================================
   Favoritos (funcionalidad global — usa LocalStorage)
   ========================================================================== */
function obtenerFavoritos() {
  return JSON.parse(localStorage.getItem("uv-favoritos") || "[]");
}

function esFavorito(movieId) {
  return obtenerFavoritos().includes(movieId);
}

function toggleFavorito(movieId) {
  let favoritos = obtenerFavoritos();
  if (favoritos.includes(movieId)) {
    favoritos = favoritos.filter((id) => id !== movieId);
  } else {
    favoritos.push(movieId);
  }
  localStorage.setItem("uv-favoritos", JSON.stringify(favoritos));
  return esFavorito(movieId);
}

async function initHome() {
  try {
    const populares = await getPopularMovies();
    pintarCarrusel(populares.slice(0, 5));
    pintarPopulares(populares.slice(5, 13));
  } catch (error) {
    console.error("Error cargando datos de TMDb:", error);
    document.getElementById("carruselInner").innerHTML = `
      <div class="carousel-item active">
        <div class="d-flex justify-content-center align-items-center text-danger" style="height:300px;">
          No se pudo conectar con la API de TMDb.
        </div>
      </div>`;
  }
}

/** Pinta el carrusel de estrenos destacados en index.html */
function pintarCarrusel(peliculas) {
  const contenedor = document.getElementById("carruselInner");
  contenedor.innerHTML = peliculas
    .map(
      (pelicula, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <div class="d-flex flex-column flex-md-row align-items-center gap-4 p-4"
             style="background-color: var(--uv-bg-alt); min-height: 400px;">
          <img src="${getPosterUrl(pelicula.poster_path)}"
               alt="Póster de ${pelicula.title}"
               style="width: 180px; border-radius: 10px;">
          <div>
            <p class="eyebrow mb-1">Destacada</p>
            <h3 class="text-white">${pelicula.title}</h3>
            <p class="text-secondary" style="max-width: 500px;">
              ${pelicula.overview ? pelicula.overview.slice(0, 180) + "..." : "Sin sinopsis disponible."}
            </p>
            <span class="btn-uv-primary">⭐ ${pelicula.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>`
    )
    .join("");
}

/** Pinta las cards de películas populares en index.html */
function pintarPopulares(peliculas) {
  const contenedor = document.getElementById("contenedorPopulares");
  contenedor.innerHTML = peliculas.map((pelicula) => tarjetaPeliculaHTML(pelicula)).join("");
  activarBotonesFavorito(contenedor);
}

/** Genera el HTML de una card de película (reutilizable en index y cartelera) */
function tarjetaPeliculaHTML(pelicula) {
  const favMarcado = esFavorito(pelicula.id);
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card-uv h-100">
        <button class="btn-favorito" data-id="${pelicula.id}" aria-label="Marcar como favorita">
          ${favMarcado ? "❤️" : "🤍"}
        </button>
        <img src="${getPosterUrl(pelicula.poster_path)}" alt="Póster de ${pelicula.title}" loading="lazy">
        <div class="card-body p-3">
          <h6 class="mb-1">${pelicula.title}</h6>
          <small>${pelicula.release_date ? pelicula.release_date.split("-")[0] : "—"} · ⭐ ${pelicula.vote_average.toFixed(1)}</small>
        </div>
      </div>
    </div>`;
}

/** Delega el clic en los botones de favorito dentro de un contenedor dado */
function activarBotonesFavorito(contenedor) {
  contenedor.querySelectorAll(".btn-favorito").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      const ahoraEsFavorito = toggleFavorito(id);
      boton.textContent = ahoraEsFavorito ? "❤️" : "🤍";
    });
  });
}