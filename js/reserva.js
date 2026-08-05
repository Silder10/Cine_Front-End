/* ==========================================================================
   UltraVision — reservas.js
   Lógica exclusiva de pages/reservas.html
   ========================================================================== */

const PRECIO_BOLETO = 12000;
const FILAS = ["A", "B", "C", "D", "E", "F"];
const COLUMNAS = 8;

let asientosOcupados = [];
let asientosSeleccionados = [];

document.addEventListener("DOMContentLoaded", () => {
  generarAsientosOcupados();
  pintarMapaAsientos();
  cargarPeliculasSelect();
  actualizarResumen();

  document.getElementById("formReserva").addEventListener("submit", manejarSubmitReserva);
});

/** Simula asientos ya ocupados (aleatorios, fijos por sesión de página) */
function generarAsientosOcupados() {
  const total = FILAS.length * COLUMNAS;
  const cantidadOcupados = Math.floor(total * 0.25);
  const idsPosibles = FILAS.flatMap((fila) =>
    Array.from({ length: COLUMNAS }, (_, i) => `${fila}${i + 1}`)
  );
  asientosOcupados = idsPosibles.sort(() => 0.5 - Math.random()).slice(0, cantidadOcupados);
}

/** Dibuja el grid de asientos (Tailwind puro) */
function pintarMapaAsientos() {
  const contenedor = document.getElementById("mapaAsientos");
  contenedor.innerHTML = "";

  FILAS.forEach((fila) => {
    for (let col = 1; col <= COLUMNAS; col++) {
      const idAsiento = `${fila}${col}`;
      const ocupado = asientosOcupados.includes(idAsiento);

      const boton = document.createElement("button");
      boton.type = "button";
      boton.dataset.asiento = idAsiento;
      boton.textContent = idAsiento;
      boton.disabled = ocupado;

      const clasesBase = "w-8 h-8 text-[10px] rounded flex items-center justify-center transition-colors";
      boton.className = ocupado
        ? `${clasesBase} bg-white/10 text-white/30 cursor-not-allowed`
        : `${clasesBase} bg-uvcard text-uvgray border border-white/10 hover:border-uvglow cursor-pointer`;

      if (!ocupado) {
        boton.addEventListener("click", () => alternarAsiento(idAsiento, boton));
      }

      contenedor.appendChild(boton);
    }
  });
}

/** Selecciona/deselecciona un asiento disponible */
function alternarAsiento(idAsiento, boton) {
  const clasesBase = "w-8 h-8 text-[10px] rounded flex items-center justify-center transition-colors";

  if (asientosSeleccionados.includes(idAsiento)) {
    asientosSeleccionados = asientosSeleccionados.filter((a) => a !== idAsiento);
    boton.className = `${clasesBase} bg-uvcard text-uvgray border border-white/10 hover:border-uvglow cursor-pointer`;
  } else {
    asientosSeleccionados.push(idAsiento);
    boton.className = `${clasesBase} bg-uvblue text-white cursor-pointer`;
  }

  actualizarResumen();
}

/** Actualiza el contador de asientos y el total a pagar */
function actualizarResumen() {
  document.getElementById("resumenCantidad").textContent = asientosSeleccionados.length;
  const total = asientosSeleccionados.length * PRECIO_BOLETO;
  document.getElementById("resumenTotal").textContent = `$${total.toLocaleString("es-CO")}`;
}

/** Carga las películas populares en el <select> de la función */
async function cargarPeliculasSelect() {
  const select = document.getElementById("selectPelicula");
  try {
    const peliculas = await getPopularMovies();
    select.innerHTML = peliculas
      .map((p) => `<option value="${p.id}" data-titulo="${p.title}" data-poster="${p.poster_path || ""}">${p.title}</option>`)
      .join("");
  } catch (error) {
    select.innerHTML = `<option value="">No se pudo cargar la cartelera</option>`;
  }
}

/** Valida el formulario y, si todo es correcto, crea el boleto en LocalStorage */
function manejarSubmitReserva(evento) {
  evento.preventDefault();

  const nombre = document.getElementById("inputNombre").value.trim();
  const email = document.getElementById("inputEmail").value.trim();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errorNombre = document.querySelector('[data-error="nombre"]');
  const errorEmail = document.querySelector('[data-error="email"]');
  const errorAsientos = document.querySelector('[data-error="asientos"]');

  let esValido = true;

  errorNombre.classList.toggle("hidden", nombre.length >= 3);
  if (nombre.length < 3) esValido = false;

  errorEmail.classList.toggle("hidden", regexEmail.test(email));
  if (!regexEmail.test(email)) esValido = false;

  errorAsientos.classList.toggle("hidden", asientosSeleccionados.length > 0);
  if (asientosSeleccionados.length === 0) esValido = false;

  if (!esValido) return;

  const selectPelicula = document.getElementById("selectPelicula");
  const opcionSeleccionada = selectPelicula.options[selectPelicula.selectedIndex];

  const boleto = {
    movieId: selectPelicula.value,
    movieTitle: opcionSeleccionada?.dataset.titulo || "Película",
    poster: opcionSeleccionada?.dataset.poster || "",
    funcion: document.getElementById("selectFuncion").value,
    asientos: [...asientosSeleccionados],
    total: asientosSeleccionados.length * PRECIO_BOLETO,
    comprador: { nombre, email },
    fechaCompra: new Date().toISOString(),
  };

  crearBoleto(boleto);

  document.getElementById("mensajeExito").classList.remove("hidden");
  document.getElementById("formReserva").reset();
  asientosSeleccionados = [];
  pintarMapaAsientos();
  actualizarResumen();
}