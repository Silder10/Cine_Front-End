/* ==========================================================================
   UltraVision — detalle.js
   Lógica exclusiva de pages/detalle.html
   ========================================================================== */

document.addEventListener("DOMContentLoaded", cargarDetalle);

async function cargarDetalle() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get("id");
  const contenedor = document.getElementById("contenidoDetalle");

  if (!id) {
    contenedor.innerHTML = `<p class="text-danger">No se especificó ninguna película.</p>`;
    return;
  }

  try {
    const pelicula = await getMovieDetail(id);
    pintarDetalle(pelicula);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p class="text-danger">No se pudo cargar la información de esta película.</p>`;
  }
}

function pintarDetalle(pelicula) {
  const contenedor = document.getElementById("contenidoDetalle");
  const generos = pelicula.genres.map((g) => g.name).join(" · ");
  const anio = pelicula.release_date ? pelicula.release_date.split("-")[0] : "—";
  const duracion = pelicula.runtime ? `${pelicula.runtime} min` : "—";

  const reparto = (pelicula.credits?.cast || []).slice(0, 8);
  const trailer = (pelicula.videos?.results || []).find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );

  contenedor.innerHTML = `
    <div class="row g-5">
      <div class="col-md-4">
        <img src="${getPosterUrl(pelicula.poster_path)}" alt="Póster de ${pelicula.title}"
             class="img-fluid rounded-4 w-100">
      </div>
      <div class="col-md-8">
        <p class="eyebrow mb-1">${generos}</p>
        <h1 class="mb-2">${pelicula.title}</h1>
        <p class="text-secondary mb-3">${anio} · ${duracion} · ⭐ ${pelicula.vote_average.toFixed(1)}</p>
        <p style="max-width: 700px;">${pelicula.overview || "Sin sinopsis disponible."}</p>

        <div class="d-flex gap-3 flex-wrap mt-4">
          <a href="reservas.html?movieId=${pelicula.id}" class="btn-uv-primary">Reservar boletos</a>
          ${trailer ? `<button class="btn-uv-outline" id="btnVerTrailer">Ver trailer</button>` : ""}
        </div>

        <h5 class="mt-5 mb-3">Reparto principal</h5>
        <div class="d-flex gap-3 flex-wrap">
          ${reparto
            .map(
              (actor) => `
            <div class="text-center" style="width: 90px;">
              <img src="${actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "https://placehold.co/200x200/1B2540/B8C1D1?text=%3F"}"
                   alt="${actor.name}" class="rounded-circle mb-1" style="width: 70px; height: 70px; object-fit: cover;">
              <p class="small mb-0">${actor.name}</p>
              <p class="small text-secondary mb-0">${actor.character || ""}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  if (trailer) {
    document.getElementById("btnVerTrailer").addEventListener("click", () => {
      document.getElementById("contenedorTrailer").innerHTML = `
        <iframe src="https://www.youtube.com/embed/${trailer.key}" title="Trailer de ${pelicula.title}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>`;
      new bootstrap.Modal(document.getElementById("modalTrailer")).show();
    });
  }
}
