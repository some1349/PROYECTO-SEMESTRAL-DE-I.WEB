// ===== LÓGICA DEL PROTOTIPO =====
// Conceptos usados: variables, funciones, arreglos y objetos, DOM,
// eventos (addEventListener) y validación de formularios.

// ---------- Funciones de ayuda ----------
function $(id) { return document.getElementById(id); }

function buscarInstalacion(id) {
  return instalaciones.find(function (i) { return i.id === id; });
}

// Una hora está ocupada si hay una reserva no cancelada o un bloqueo
function estadoHora(instalacionId, fecha, hora) {
  for (let i = 0; i < bloqueos.length; i++) {
    const b = bloqueos[i];
    if (b.instalacionId === instalacionId && b.fecha === fecha && b.hora === hora) return "bloqueada";
  }
  for (let i = 0; i < reservas.length; i++) {
    const r = reservas[i];
    if (r.instalacionId === instalacionId && r.fecha === fecha && r.hora === hora && r.estado !== "cancelada") return "ocupada";
  }
  return "libre";
}

// Crea un elemento HTML con texto y clase
function crear(etiqueta, texto, clase) {
  const e = document.createElement(etiqueta);
  e.textContent = texto;
  if (clase) e.className = clase;
  return e;
}

// Crea un botón con una acción al hacer clic
function crearBoton(texto, clase, accion) {
  const b = crear("button", texto, clase);
  b.type = "button";
  b.addEventListener("click", accion);
  return b;
}

// Dibuja una tabla: encabezados + filas (cada celda es texto o un elemento)
function dibujarTabla(idTabla, encabezados, filas) {
  const t = $(idTabla);
  t.innerHTML = "";
  const cabecera = document.createElement("tr");
  encabezados.forEach(function (h) { cabecera.appendChild(crear("th", h)); });
  t.appendChild(cabecera);
  filas.forEach(function (fila) {
    const tr = document.createElement("tr");
    fila.forEach(function (celda) {
      const td = document.createElement("td");
      if (typeof celda === "string") td.textContent = celda;
      else td.appendChild(celda);
      tr.appendChild(td);
    });
    t.appendChild(tr);
  });
}

function etiquetaEstado(estado) {
  return crear("span", estado.charAt(0).toUpperCase() + estado.slice(1), "estado " + estado);
}

function mostrarMensaje(texto) {
  const m = $("mensaje");
  m.textContent = texto;
  m.classList.remove("oculta");
}

function formatoFecha(f) { // 2026-10-15 -> 15/10/2026
  const p = f.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

// ---------- Navegación entre pantallas ----------
function mostrar(id) {
  const pantallas = document.querySelectorAll(".pantalla");
  pantallas.forEach(function (p) { p.classList.add("oculta"); });
  $(id).classList.remove("oculta");
  $("mensaje").classList.add("oculta");
  $("ruta").textContent = titulos[id];

  // Antes de mostrar, se llenan los datos de la pantalla
  if (id === "buscar") pintarInstalaciones();
  if (id === "detalle") pintarDetalle();
  if (id === "confirmar") pintarConfirmar();
  if (id === "mis-reservas") pintarMisReservas();
  if (id === "op-dia") pintarDia();
  if (id === "presencial") llenarSelects("pres-instalacion", "pres-hora");
  if (id === "disponibilidad") pintarDisponibilidad();
  if (id === "a-panel") pintarPanel();
  if (id === "a-instalaciones") pintarInstalacionesAdmin();
  if (id === "a-bloqueos") { llenarSelects("blq-instalacion", "blq-hora"); pintarBloqueos(); }
  if (id === "a-reportes") pintarReportes();
  if (id === "a-usuarios") pintarUsuarios();

  construirMenu(id);
  construirLateral(id);
  $(id).querySelector("h1").focus();   // el foco va al título (accesibilidad)
  window.scrollTo(0, 0);
}

function construirMenu(actual) {
  const menu = $("menu");
  menu.innerHTML = "";
  if (!seleccion.rol) return;
  menus[seleccion.rol].forEach(function (item) {
    const b = crearBoton(item[1], actual === item[0] ? "activo" : "", function () { mostrar(item[0]); });
    menu.appendChild(b);
  });
}

// Menú lateral del administrador, agrupado por secciones
const grupoLateral = [
  ["Gestión", [["a-panel", "Panel"], ["a-instalaciones", "Instalaciones y horarios"], ["a-bloqueos", "Bloqueos"]]],
  ["Análisis", [["a-reportes", "Reportes"]]],
  ["Seguridad", [["a-usuarios", "Usuarios y roles"]]],
  ["Operación", [["op-dia", "Reservas del día"], ["presencial", "Reserva presencial"], ["disponibilidad", "Disponibilidad"]]]
];

function construirLateral(actual) {
  const lat = $("lateral");
  lat.innerHTML = "";
  if (seleccion.rol !== "admin") { lat.classList.add("oculta"); return; }
  lat.classList.remove("oculta");
  grupoLateral.forEach(function (g) {
    lat.appendChild(crear("h2", g[0]));
    g[1].forEach(function (item) {
      lat.appendChild(crearBoton(item[1], actual === item[0] ? "activo" : "", function () { mostrar(item[0]); }));
    });
  });
}

function entrar(rol) {
  seleccion.rol = rol;
  const u = $("usuario");
  u.innerHTML = "";
  u.appendChild(document.createTextNode(nombresRol[rol] + " "));
  u.appendChild(crearBoton("Cerrar sesión", "", salir));
  const inicio = { cliente: "buscar", operativo: "op-dia", admin: "a-panel" };
  mostrar(inicio[rol]);
}

function salir() {
  seleccion.rol = null;
  $("usuario").innerHTML = "";
  mostrar("login");
}

// ---------- Validación de formularios ----------
function ponerError(idCampo, texto) {
  $("error-" + idCampo).textContent = texto;
  $(idCampo).classList.toggle("invalido", texto !== "");
  if (texto !== "") $(idCampo).setAttribute("aria-invalid", "true");
  else $(idCampo).removeAttribute("aria-invalid");
}

function validarLogin() {
  let ok = true;
  const correo = $("login-correo").value.trim();
  const clave = $("login-clave").value;
  if (correo === "" || !correo.includes("@")) { ponerError("login-correo", "Escribe un correo válido."); ok = false; }
  else ponerError("login-correo", "");
  if (clave === "") { ponerError("login-clave", "Escribe tu contraseña."); ok = false; }
  else ponerError("login-clave", "");
  return ok;
}

function validarRegistro() {
  let ok = true;
  if ($("reg-nombre").value.trim() === "") { ponerError("reg-nombre", "El nombre es obligatorio."); ok = false; }
  else ponerError("reg-nombre", "");
  if (!$("reg-correo").value.includes("@")) { ponerError("reg-correo", "Escribe un correo válido."); ok = false; }
  else ponerError("reg-correo", "");
  if ($("reg-clave").value.length < 6) { ponerError("reg-clave", "La contraseña debe tener al menos 6 caracteres."); ok = false; }
  else ponerError("reg-clave", "");
  return ok;
}

// ---------- CLIENTE: buscar y reservar ----------
function pintarInstalaciones() {
  const cont = $("lista-instalaciones");
  cont.innerHTML = "";
  const deporte = $("filtro-deporte").value;
  instalaciones.forEach(function (inst) {
    if (!inst.activa) return;
    if (deporte !== "todos" && inst.deporte !== deporte) return;
    const tarjeta = crear("div", "", "tarjeta foto");
    const iconos = { "Fútbol": "⚽", "Baloncesto": "🏀", "Pádel": "🎾" };
    const imagen = crear("div", iconos[inst.deporte], "imagen " + inst.deporte.toLowerCase().replace("á", "a"));
    imagen.setAttribute("aria-hidden", "true");       // es decorativa
    tarjeta.appendChild(imagen);
    const cuerpo = crear("div", "", "cuerpo");
    cuerpo.appendChild(crear("h2", inst.nombre));
    cuerpo.appendChild(crear("p", inst.deporte + " · hasta " + inst.capacidad + " personas"));
    cuerpo.appendChild(crear("p", "$" + inst.precio + " por hora"));
    tarjeta.appendChild(cuerpo);
    cuerpo.appendChild(crearBoton("Ver disponibilidad", "boton", function () {
      seleccion.instalacionId = inst.id;
      mostrar("detalle");
    }));
    cont.appendChild(tarjeta);
  });
  if (cont.children.length === 0) cont.appendChild(crear("p", "No hay canchas para ese deporte."));
}

function pintarDetalle() {
  const inst = buscarInstalacion(seleccion.instalacionId);
  const fecha = $("filtro-fecha").value;
  $("detalle-titulo").textContent = inst.nombre;
  $("detalle-info").textContent = "Fecha: " + formatoFecha(fecha) + " · Precio: $" + inst.precio + " por hora · Capacidad: " + inst.capacidad + " personas";
  const cont = $("lista-horarios");
  cont.innerHTML = "";
  HORAS.forEach(function (hora) {
    const libre = estadoHora(inst.id, fecha, hora) === "libre";
    const b = crearBoton(hora, "", function () { seleccion.hora = hora; mostrar("confirmar"); });
    if (!libre) { b.disabled = true; b.title = "No disponible"; }
    cont.appendChild(b);
  });
}

function pintarConfirmar() {
  const inst = buscarInstalacion(seleccion.instalacionId);
  dibujarTabla("tabla-confirmar", ["Dato", "Detalle"], [
    ["Instalación", inst.nombre],
    ["Fecha", formatoFecha($("filtro-fecha").value)],
    ["Horario", seleccion.hora],
    ["Total", "$" + inst.precio]
  ]);
}

function confirmarReserva() {
  const codigo = "SR-" + (20400 + reservas.length);
  reservas.push({ codigo: codigo, cliente: "Ana Pérez", instalacionId: seleccion.instalacionId,
                  fecha: $("filtro-fecha").value, hora: seleccion.hora, estado: "confirmada" });
  mostrar("exito");
  $("exito-texto").textContent = "Tu código de reserva es " + codigo + ". Preséntalo al llegar a la cancha.";
}

function pintarMisReservas() {
  const filas = [];
  reservas.forEach(function (r) {
    if (r.cliente !== "Ana Pérez") return;
    const acciones = document.createElement("span");
    if (r.estado === "confirmada") {
      acciones.appendChild(crearBoton("Modificar", "boton chico claro", function () { abrirModificar(r); }));
      acciones.appendChild(document.createTextNode(" "));
      acciones.appendChild(crearBoton("Cancelar", "boton chico rojo", function () {
        if (confirm("¿Seguro que quieres cancelar la reserva " + r.codigo + "?")) {
          r.estado = "cancelada";
          pintarMisReservas();
          mostrarMensaje("La reserva " + r.codigo + " fue cancelada.");
        }
      }));
    } else acciones.textContent = "—";
    filas.push([r.codigo, buscarInstalacion(r.instalacionId).nombre, formatoFecha(r.fecha) + " " + r.hora, etiquetaEstado(r.estado), acciones]);
  });
  dibujarTabla("tabla-mis-reservas", ["Código", "Instalación", "Fecha y hora", "Estado", "Acciones"], filas);
}

function abrirModificar(r) {
  seleccion.codigoEditando = r.codigo;
  mostrar("modificar");
  $("modificar-info").textContent = "Reserva " + r.codigo + " · " + buscarInstalacion(r.instalacionId).nombre;
  $("mod-fecha").value = r.fecha;
  const sel = $("mod-hora");
  sel.innerHTML = "";
  HORAS.forEach(function (h) { sel.appendChild(crear("option", h)); });
  sel.value = r.hora;
}

function guardarModificacion() {
  const r = reservas.find(function (x) { return x.codigo === seleccion.codigoEditando; });
  const fecha = $("mod-fecha").value;
  const hora = $("mod-hora").value;
  if (fecha === "") { ponerError("mod-fecha", "Elige una fecha."); return; }
  ponerError("mod-fecha", "");
  const cambio = (fecha !== r.fecha || hora !== r.hora);
  if (cambio && estadoHora(r.instalacionId, fecha, hora) !== "libre") {
    ponerError("mod-fecha", "Ese horario no está disponible. Elige otro.");
    return;
  }
  r.fecha = fecha; r.hora = hora;
  mostrar("mis-reservas");
  mostrarMensaje("La reserva " + r.codigo + " fue modificada.");
}

// ---------- OPERATIVO ----------
function pintarDia() {
  const filas = [];
  reservas.forEach(function (r) {
    if (r.fecha !== HOY || r.estado === "cancelada") return;
    const accion = document.createElement("span");
    if (r.estado === "confirmada") {
      accion.appendChild(crearBoton("Confirmar check-in", "boton chico", function () {
        r.estado = "asistida";
        pintarDia();
        mostrarMensaje("Check-in confirmado: " + r.cliente + " (" + r.hora + ").");
      }));
    } else accion.textContent = "—";
    filas.push([r.hora, r.cliente, buscarInstalacion(r.instalacionId).nombre, etiquetaEstado(r.estado), accion]);
  });
  filas.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
  dibujarTabla("tabla-dia", ["Hora", "Cliente", "Instalación", "Estado", "Acción"], filas);
}

// Llena los selects de instalación y horario (reserva presencial y bloqueos)
function llenarSelects(idInstalacion, idHora) {
  const si = $(idInstalacion), sh = $(idHora);
  si.innerHTML = ""; sh.innerHTML = "";
  instalaciones.forEach(function (i) {
    const o = crear("option", i.nombre); o.value = i.id; si.appendChild(o);
  });
  HORAS.forEach(function (h) { sh.appendChild(crear("option", h)); });
}

function pintarDisponibilidad() {
  const filas = [];
  instalaciones.forEach(function (inst) {
    if (!inst.activa) return;
    const fila = [inst.nombre];
    HORAS.forEach(function (h) {
      const e = estadoHora(inst.id, HOY, h);
      fila.push(etiquetaEstado(e));
    });
    filas.push(fila);
  });
  dibujarTabla("tabla-disponibilidad", ["Instalación"].concat(HORAS), filas);
}

// ---------- ADMINISTRADOR ----------
function pintarPanel() {
  const cont = $("indicadores");
  cont.innerHTML = "";
  let hoy = 0, ingresos = 0;
  reservas.forEach(function (r) {
    if (r.fecha === HOY && r.estado !== "cancelada") hoy++;
    if (r.estado === "asistida") ingresos += buscarInstalacion(r.instalacionId).precio;
  });
  const datos = [[hoy, "Reservas de hoy"], [reservas.length, "Reservas totales"], ["$" + ingresos, "Ingresos (reservas asistidas)"]];
  datos.forEach(function (d) {
    const t = crear("div", "", "tarjeta");
    t.appendChild(crear("div", String(d[0]), "numero"));
    t.appendChild(crear("div", d[1]));
    cont.appendChild(t);
  });
}

function pintarInstalacionesAdmin() {
  const filas = instalaciones.map(function (inst) {
    const b = crearBoton(inst.activa ? "Desactivar" : "Activar", "boton chico claro", function () {
      inst.activa = !inst.activa;
      pintarInstalacionesAdmin();
    });
    return [inst.nombre, inst.deporte, "$" + inst.precio, etiquetaEstado(inst.activa ? "confirmada" : "bloqueada"), b];
  });
  dibujarTabla("tabla-instalaciones", ["Nombre", "Deporte", "Precio/hora", "Estado", "Acción"], filas);
  // el texto de la etiqueta dice Confirmada/Bloqueada: lo cambiamos a Activa/Inactiva
  const celdas = $("tabla-instalaciones").querySelectorAll(".estado");
  celdas.forEach(function (c) { c.textContent = c.textContent === "Confirmada" ? "Activa" : "Inactiva"; });
}

function pintarBloqueos() {
  const filas = bloqueos.map(function (b, indice) {
    const quitar = crearBoton("Quitar", "boton chico rojo", function () {
      bloqueos.splice(indice, 1);
      pintarBloqueos();
    });
    return [buscarInstalacion(b.instalacionId).nombre, formatoFecha(b.fecha), b.hora, b.motivo, quitar];
  });
  dibujarTabla("tabla-bloqueos", ["Instalación", "Fecha", "Horario", "Motivo", "Acción"], filas);
}

function pintarReportes() {
  const filas = instalaciones.map(function (inst) {
    let total = 0, asistidas = 0, ingresos = 0;
    reservas.forEach(function (r) {
      if (r.instalacionId !== inst.id || r.estado === "cancelada") return;
      total++;
      if (r.estado === "asistida") { asistidas++; ingresos += inst.precio; }
    });
    return [inst.nombre, String(total), String(asistidas), "$" + ingresos];
  });
  dibujarTabla("tabla-reportes", ["Instalación", "Reservas", "Asistidas", "Ingresos"], filas);
}

function pintarUsuarios() {
  const filas = usuarios.map(function (u) {
    const sel = document.createElement("select");
    sel.setAttribute("aria-label", "Rol de " + u.nombre);
    ["Cliente", "Personal operativo", "Administrador"].forEach(function (r) { sel.appendChild(crear("option", r)); });
    sel.value = u.rol;
    sel.addEventListener("change", function () { u.rol = sel.value; mostrarMensaje("Rol de " + u.nombre + " cambiado a " + u.rol + "."); });
    return [u.nombre, u.correo, sel];
  });
  dibujarTabla("tabla-usuarios", ["Nombre", "Correo", "Rol"], filas);
}

// ---------- EVENTOS (se conectan una sola vez al cargar) ----------
// Botones que solo cambian de pantalla: tienen el atributo data-ir
document.querySelectorAll("[data-ir]").forEach(function (b) {
  b.addEventListener("click", function () { mostrar(b.dataset.ir); });
});

// Botones de "entrar como..."
document.querySelectorAll("[data-rol]").forEach(function (b) {
  b.addEventListener("click", function () { entrar(b.dataset.rol); });
});

// Formularios: se evita el envío real (preventDefault) y se valida
$("form-login").addEventListener("submit", function (e) {
  e.preventDefault();
  if (validarLogin()) entrar("cliente");
});
$("form-registro").addEventListener("submit", function (e) {
  e.preventDefault();
  if (validarRegistro()) { entrar("cliente"); mostrarMensaje("Cuenta creada. ¡Bienvenida!"); }
});
$("form-modificar").addEventListener("submit", function (e) { e.preventDefault(); guardarModificacion(); });
$("form-perfil").addEventListener("submit", function (e) {
  e.preventDefault();
  if ($("perfil-nombre").value.trim() === "") { ponerError("perfil-nombre", "El nombre no puede estar vacío."); return; }
  ponerError("perfil-nombre", "");
  mostrarMensaje("Perfil guardado.");
});
$("form-presencial").addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = $("pres-nombre").value.trim();
  if (nombre === "") { ponerError("pres-nombre", "Escribe el nombre del cliente."); return; }
  ponerError("pres-nombre", "");
  const id = Number($("pres-instalacion").value), hora = $("pres-hora").value;
  if (estadoHora(id, HOY, hora) !== "libre") { ponerError("pres-nombre", "Ese horario no está disponible."); return; }
  reservas.push({ codigo: "SR-" + (20400 + reservas.length), cliente: nombre, instalacionId: id, fecha: HOY, hora: hora, estado: "asistida" });
  $("pres-nombre").value = "";
  mostrarMensaje("Reserva presencial registrada para " + nombre + ".");
});
$("form-bloqueo").addEventListener("submit", function (e) {
  e.preventDefault();
  const motivo = $("blq-motivo").value.trim();
  if (motivo === "") { ponerError("blq-motivo", "Escribe el motivo del bloqueo."); return; }
  ponerError("blq-motivo", "");
  const id = Number($("blq-instalacion").value), hora = $("blq-hora").value;
  if (estadoHora(id, HOY, hora) !== "libre") { ponerError("blq-motivo", "Ese horario ya está ocupado o bloqueado."); return; }
  bloqueos.push({ instalacionId: id, fecha: HOY, hora: hora, motivo: motivo });
  $("blq-motivo").value = "";
  pintarBloqueos();
  mostrarMensaje("Horario bloqueado.");
});

$("btn-confirmar").addEventListener("click", confirmarReserva);
$("filtro-deporte").addEventListener("change", pintarInstalaciones);

// Pantalla inicial
mostrar("login");
