/* ==========================================================================
   UltraVision — mis-boletos.js
   Lógica exclusiva de pages/mis-boletos.html (CRUD sobre LocalStorage)
   ========================================================================== */

let idAEliminar = null;
let modalEditar, modalEliminar, toastNotificacion;

document.addEventListener("DOMContentLoaded", () => {
  modalEditar = new bootstrap.Modal(document.getElementById("modalEditar"));
  modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminar"));
  toastNotificacion = new bootstrap.Toast(document.getElementById("toastNotificacion"));

  pintarBoletos();

  document.getElementById("formEditar").addEventListener("submit", guardarEdicion);
  document.getElementById("btnConfirmarEliminar").addEventListener("click", confirmarEliminacion);
});

/** Lista todos los boletos guardados en LocalStorage */
function pintarBoletos() {
  const boletos = obtenerBoletos();
  const contenedor = document.getElementById("contenedorBoletos");
  const estadoVacio = document.getElementById("estadoVacio");

  if (boletos.length === 0) {
    contenedor.innerHTML = "";
    estadoVacio.classList.remove("d-none");
    return;
  }

  estadoVacio.classList.add("d-none");
  contenedor.innerHTML = boletos
    .map((boleto) => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card-uv h-100 p-3 d-flex flex-column">
          <div class="d-flex gap-3">
            <img src="${getPosterUrl(boleto.poster)}" alt="Póster de ${boleto.movieTitle}"
                 style="width: 70px; height: 105px; object-fit: cover; border-radius: 8px;">
            <div>
              <h6 class="mb-1">${boleto.movieTitle}</h6>
              <small class="text-secondary d-block">${boleto.funcion}</small>
              <small class="text-secondary d-block">Asientos: ${boleto.asientos.join(", ")}</small>
              <small class="text-secondary d-block">${boleto.comprador.nombre}</small>
            </div>
          </div>
          <p class="mt-3 mb-2 fw-semibold" style="color: var(--uv-blue-glow);">
            Total: $${boleto.total.toLocaleString("es-CO")}
          </p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn-uv-outline btn-sm flex-fill" onclick="abrirModalEditar(${boleto.id})">Editar</button>
            <button class="btn btn-outline-danger btn-sm flex-fill" onclick="abrirModalEliminar(${boleto.id})">Cancelar</button>
          </div>
        </div>
      </div>`)
    .join("");
}

/** Abre el modal de edición precargado con los datos del boleto */
function abrirModalEditar(id) {
  const boleto = obtenerBoletoPorId(id);
  if (!boleto) return;

  document.getElementById("editarId").value = boleto.id;
  document.getElementById("editarFuncion").value = boleto.funcion;
  document.getElementById("editarNombre").value = boleto.comprador.nombre;
  document.getElementById("editarEmail").value = boleto.comprador.email;

  modalEditar.show();
}

/** Guarda los cambios hechos en el modal de edición */
function guardarEdicion(evento) {
  evento.preventDefault();

  const id = Number(document.getElementById("editarId").value);
  const nombre = document.getElementById("editarNombre").value.trim();
  const email = document.getElementById("editarEmail").value.trim();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (nombre.length < 3 || !regexEmail.test(email)) {
    mostrarToast("Revisa el nombre y el correo antes de guardar.");
    return;
  }

  const boleto = obtenerBoletoPorId(id);
  boleto.funcion = document.getElementById("editarFuncion").value;
  boleto.comprador.nombre = nombre;
  boleto.comprador.email = email;

  actualizarBoleto(boleto);
  modalEditar.hide();
  pintarBoletos();
  mostrarToast("Reserva actualizada correctamente.");
}

/** Guarda el id pendiente de eliminar y abre el modal de confirmación */
function abrirModalEliminar(id) {
  idAEliminar = id;
  modalEliminar.show();
}

/** Elimina el boleto confirmado */
function confirmarEliminacion() {
  if (idAEliminar === null) return;
  eliminarBoleto(idAEliminar);
  idAEliminar = null;
  modalEliminar.hide();
  pintarBoletos();
  mostrarToast("Reserva cancelada.");
}

/** Muestra el Toast con un mensaje dado */
function mostrarToast(mensaje) {
  document.getElementById("toastMensaje").textContent = mensaje;
  toastNotificacion.show();
}