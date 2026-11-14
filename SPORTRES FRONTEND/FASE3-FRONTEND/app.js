// ===== LÓGICA DE SPORTRES (Fase 3) =====
// Conceptos usados: variables, funciones, arreglos y objetos, DOM,
// eventos (addEventListener) y validación de formularios.
// Novedad de la Fase 3: la navegación usa la dirección (#/pantalla), así los
// enlaces y el botón "Atrás" del navegador funcionan.

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

// Cuenta cuántos horarios libres tiene una instalación en una fecha
function contarLibres(instalacionId, fecha) {
  let libres = 0;
  HORAS.forEach(function (h) {
    if (estadoHora(instalacionId, fecha, h) === "libre") libres++;
  });
  return libres;
}

// Crea un elemento HTML con texto y clase
function crear(etiqueta, texto, clase) {
  const e = document.createElement(etiqueta);
  e.textContent = texto;
  if (clase) e.className = clase;
  return e;
}

// Crea un botón con una acción al hacer clic.
// "descripcion" (opcional) es el texto completo que leen los lectores de pantalla.
function crearBoton(texto, clase, accion, descripcion) {
  const b = crear("button", texto, clase);
  b.type = "button";
  b.addEventListener("click", accion);
  if (descripcion) b.setAttribute("aria-label", descripcion);
  return b;
}

// Dibuja una tabla: título (para lectores de pantalla), encabezados y filas.
// Cada celda guarda su encabezado en data-label (en el celular se muestra como título).
function dibujarTabla(idTabla, titulo, encabezados, filas, textoVacio) {
  const t = $(idTabla);
  t.innerHTML = "";
  t.appendChild(crear("caption", titulo, "solo-lector"));

  const thead = document.createElement("thead");
  const cabecera = document.createElement("tr");
  encabezados.forEach(function (h) {
    const th = crear("th", h);
    th.scope = "col";
    cabecera.appendChild(th);
  });
  thead.appendChild(cabecera);
  t.appendChild(thead);

  const tbody = document.createElement("tbody");
  if (filas.length === 0 && textoVacio) {
    const tr = document.createElement("tr");
    const td = crear("td", textoVacio);
    td.colSpan = encabezados.length;
    td.setAttribute("data-label", "");
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  filas.forEach(function (fila) {
    const tr = document.createElement("tr");
    fila.forEach(function (celda, i) {
      const td = document.createElement("td");
      td.setAttribute("data-label", encabezados[i]);
      if (typeof celda === "string") td.textContent = celda;
      else td.appendChild(celda);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  t.appendChild(tbody);
}

// Etiqueta de estado. "texto" y "clase" son opcionales (para Activa/Inactiva)
function etiquetaEstado(estado, texto, clase) {
  const t = texto || estado.charAt(0).toUpperCase() + estado.slice(1);
  return crear("span", t, "estado " + (clase || estado));
}

// Mensaje visible + aviso para lectores de pantalla
function mostrarMensaje(texto) {
  const m = $("mensaje");
  m.textContent = texto;
  m.classList.remove("oculta");
  $("anuncio").textContent = "";
  $("anuncio").textContent = texto;
}

function formatoFecha(f) { // 2026-10-15 -> 15/10/2026
  const p = f.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

// ---------- Navegación entre pantallas ----------
let pantallaActual = null;

function mostrar(id) {
  pantallaActual = id;
  const pantallas = document.querySelectorAll(".pantalla");
  pantallas.forEach(function (p) { p.classList.add("oculta"); });
  $(id).classList.remove("oculta");
  $("mensaje").classList.add("oculta");
  $("ruta").textContent = "Estás en: " + titulos[id];

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

  const titulo = $(id).querySelector("h1");
  document.title = titulo.textContent + " · SportRes";   // el título de la pestaña cambia con la pantalla
  titulo.focus({ preventScroll: true });                                         // el foco va al título (accesibilidad)
  window.scrollTo(0, 0);
}

// Cambia de pantalla y actualiza la dirección (#id) para que "Atrás" funcione
function irA(id) {
  if (location.hash !== "#/" + id) location.hash = "/" + id;   // la dirección queda como #/buscar
  mostrar(id);
}

// ¿Puede esta persona abrir esta pantalla? (según su rol)
function puedeVer(id) {
  if (!$(id) || !titulos[id]) return false;
  if (!seleccion.rol) return publicas.indexOf(id) >= 0;
  return permitidas[seleccion.rol].indexOf(id) >= 0;
}

// ¿Falta algún paso previo? (por ejemplo, abrir "confirmar" sin haber elegido horario)
function faltaPaso(id) {
  if ((id === "detalle" || id === "confirmar") && seleccion.instalacionId === null) return true;
  if (id === "confirmar" && seleccion.hora === null) return true;
  if (id === "modificar" && seleccion.codigoEditando === null) return true;
  if (id === "exito" && $("exito-texto").textContent === "") return true;
  return false;
}

// Botón "Atrás", "Adelante" o enlace del menú: el navegador cambia la dirección
window.addEventListener("hashchange", function () {
  let id = location.hash.slice(2);      // quita "#/"
  if (!puedeVer(id) || faltaPaso(id)) {
    id = seleccion.rol ? inicio[seleccion.rol] : "login";
    history.replaceState(null, "", "#/" + id);     // corrige la dirección sin desplazar la página
  }
  if (id !== pantallaActual) mostrar(id);
});

// Crea un enlace de menú (<a href="#/pantalla">). La pantalla actual se marca con aria-current
function crearEnlace(texto, id, actual) {
  const a = crear("a", texto);
  a.href = "#/" + id;
  if (actual === id) a.setAttribute("aria-current", "page");
  return a;
}

function construirMenu(actual) {
  const menu = $("menu");
  menu.innerHTML = "";
  if (!seleccion.rol) return;
  menus[seleccion.rol].forEach(function (item) {
    menu.appendChild(crearEnlace(item[1], item[0], actual));
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
  grupoLateral.forEach(function (g, i) {
    const grupo = document.createElement("div");     // cada sección va en su propio bloque
    grupo.className = "grupo";
    const titulo = crear("h2", g[0]);
    grupo.appendChild(titulo);
    g[1].forEach(function (item) {
      grupo.appendChild(crearEnlace(item[1], item[0], actual));
    });
    lat.appendChild(grupo);
  });
}

function entrar(rol) {
  seleccion.rol = rol;
  const u = $("usuario");
  u.innerHTML = "";
  u.appendChild(crear("span", nombresRol[rol]));
  u.appendChild(crearBoton("Cerrar sesión", "", salir));
  irA(inicio[rol]);
}

function salir() {
  seleccion.rol = null;
  seleccion.instalacionId = null;
  seleccion.hora = null;
  seleccion.codigoEditando = null;
  $("exito-texto").textContent = "";
  $("usuario").innerHTML = "";
  irA("login");
  mostrarMensaje("Cerraste sesión.");
}

// ---------- Validación de formularios ----------
function ponerError(idCampo, texto) {
  $("error-" + idCampo).textContent = texto;
  $(idCampo).classList.toggle("invalido", texto !== "");
  if (texto !== "") $(idCampo).setAttribute("aria-invalid", "true");
  else $(idCampo).removeAttribute("aria-invalid");
}

// Lleva el foco al primer campo con error (así no hay que buscarlo)
function enfocarPrimerError(formulario) {
  const campo = formulario.querySelector(".invalido");
  if (campo) campo.focus();
}

function validarLogin() {
  let ok = true;
  const correo = $("login-correo").value.trim();
  const clave = $("login-clave").value;
  if (correo === "" || !correo.includes("@")) { ponerError("login-correo", "Escribe un correo válido, por ejemplo ana@ejemplo.com."); ok = false; }
  else ponerError("login-correo", "");
  if (clave === "") { ponerError("login-clave", "Escribe tu contraseña."); ok = false; }
  else ponerError("login-clave", "");
  return ok;
}

function validarRegistro() {
  let ok = true;
  if ($("reg-nombre").value.trim() === "") { ponerError("reg-nombre", "El nombre es obligatorio."); ok = false; }
  else ponerError("reg-nombre", "");
  if (!$("reg-correo").value.includes("@")) { ponerError("reg-correo", "Escribe un correo válido, por ejemplo ana@ejemplo.com."); ok = false; }
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
  const fecha = $("filtro-fecha").value;
  const iconos = { "Fútbol": "⚽", "Baloncesto": "🏀", "Pádel": "🎾" };
  instalaciones.forEach(function (inst) {
    if (!inst.activa) return;
    if (deporte !== "todos" && inst.deporte !== deporte) return;
    const tarjeta = crear("article", "", "tarjeta foto");
    const imagen = crear("div", iconos[inst.deporte], "imagen " + inst.deporte.toLowerCase().replace("á", "a"));
    imagen.setAttribute("aria-hidden", "true");       // es decorativa
    tarjeta.appendChild(imagen);
    const cuerpo = crear("div", "", "cuerpo");
    cuerpo.appendChild(crear("h2", inst.nombre));
    cuerpo.appendChild(crear("p", inst.deporte + " · hasta " + inst.capacidad + " personas"));
    cuerpo.appendChild(crear("p", "$" + inst.precio + " por hora", "precio"));
    if (fecha !== "") {
      const n = contarLibres(inst.id, fecha);
      cuerpo.appendChild(crear("p", n + (n === 1 ? " horario libre" : " horarios libres") + " el " + formatoFecha(fecha), "libres"));
    }
    cuerpo.appendChild(crearBoton("Ver horarios", "boton", function () {
      seleccion.instalacionId = inst.id;
      irA("detalle");
    }, "Ver horarios de " + inst.nombre));
    tarjeta.appendChild(cuerpo);
    cont.appendChild(tarjeta);
  });
  if (cont.children.length === 0) cont.appendChild(crear("p", "No hay canchas para ese deporte.", "tarjeta"));
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
    const b = crearBoton(hora, "", function () { seleccion.hora = hora; irA("confirmar"); },
                         hora + (libre ? ", disponible" : ", no disponible"));
    if (!libre) b.disabled = true;
    cont.appendChild(b);
  });
}

function pintarConfirmar() {
  const inst = buscarInstalacion(seleccion.instalacionId);
  dibujarTabla("tabla-confirmar", "Resumen de la reserva", ["Dato", "Detalle"], [
    ["Instalación", inst.nombre],
    ["Fecha", formatoFecha($("filtro-fecha").value)],
    ["Horario", seleccion.hora],
    ["Total", "$" + inst.precio]
  ]);
}

function confirmarReserva() {
  const fecha = $("filtro-fecha").value;
  // Por si el horario se ocupó mientras tanto (por ejemplo, al volver con "Atrás")
  if (estadoHora(seleccion.instalacionId, fecha, seleccion.hora) !== "libre") {
    irA("detalle");
    mostrarMensaje("Ese horario ya no está disponible. Elige otro.");
    return;
  }
  const codigo = "SR-" + (20400 + reservas.length);
  reservas.push({ codigo: codigo, cliente: "Ana Pérez", instalacionId: seleccion.instalacionId,
                  fecha: fecha, hora: seleccion.hora, estado: "confirmada" });
  $("exito-texto").textContent = "Tu código de reserva es " + codigo + ". Preséntalo al llegar a la cancha.";
  seleccion.hora = null;
  irA("exito");
}

function pintarMisReservas() {
  const filas = [];
  reservas.forEach(function (r) {
    if (r.cliente !== "Ana Pérez") return;
    const acciones = document.createElement("span");
    if (r.estado === "confirmada") {
      acciones.appendChild(crearBoton("Modificar", "boton chico claro", function () { abrirModificar(r); }, "Modificar la reserva " + r.codigo));
      acciones.appendChild(document.createTextNode(" "));
      acciones.appendChild(crearBoton("Cancelar", "boton chico rojo", function () {
        if (confirm("¿Seguro que quieres cancelar la reserva " + r.codigo + "?")) {
          r.estado = "cancelada";
          pintarMisReservas();
          mostrarMensaje("La reserva " + r.codigo + " fue cancelada.");
        }
      }, "Cancelar la reserva " + r.codigo));
    } else acciones.textContent = "Sin acciones";
    filas.push([r.codigo, buscarInstalacion(r.instalacionId).nombre, formatoFecha(r.fecha) + " " + r.hora, etiquetaEstado(r.estado), acciones]);
  });
  dibujarTabla("tabla-mis-reservas", "Mis reservas", ["Código", "Instalación", "Fecha y hora", "Estado", "Acciones"], filas,
               "Aún no tienes reservas. Usa «Nueva reserva» para empezar.");
}

function abrirModificar(r) {
  seleccion.codigoEditando = r.codigo;
  irA("modificar");
  $("modificar-info").textContent = "Reserva " + r.codigo + " · " + buscarInstalacion(r.instalacionId).nombre;
  $("mod-fecha").value = r.fecha;
  ponerError("mod-fecha", "");
  const sel = $("mod-hora");
  sel.innerHTML = "";
  HORAS.forEach(function (h) { sel.appendChild(crear("option", h)); });
  sel.value = r.hora;
}

function guardarModificacion() {
  const r = reservas.find(function (x) { return x.codigo === seleccion.codigoEditando; });
  const fecha = $("mod-fecha").value;
  const hora = $("mod-hora").value;
  if (fecha === "") { ponerError("mod-fecha", "Elige una fecha."); $("mod-fecha").focus(); return; }
  ponerError("mod-fecha", "");
  const cambio = (fecha !== r.fecha || hora !== r.hora);
  if (cambio && estadoHora(r.instalacionId, fecha, hora) !== "libre") {
    ponerError("mod-fecha", "Ese horario no está disponible. Elige otro.");
    $("mod-fecha").focus();
    return;
  }
  r.fecha = fecha; r.hora = hora;
  seleccion.codigoEditando = null;
  irA("mis-reservas");
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
      }, "Confirmar check-in de " + r.cliente + " a las " + r.hora));
    } else accion.textContent = "Sin acciones";
    filas.push([r.hora, r.cliente, buscarInstalacion(r.instalacionId).nombre, etiquetaEstado(r.estado), accion]);
  });
  filas.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
  dibujarTabla("tabla-dia", "Reservas de hoy", ["Hora", "Cliente", "Instalación", "Estado", "Acción"], filas, "No hay reservas para hoy.");
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
      fila.push(etiquetaEstado(estadoHora(inst.id, HOY, h)));
    });
    filas.push(fila);
  });
  dibujarTabla("tabla-disponibilidad", "Disponibilidad de hoy por instalación y horario", ["Instalación"].concat(HORAS), filas);
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
      mostrarMensaje(inst.nombre + (inst.activa ? " fue activada." : " fue desactivada."));
    }, (inst.activa ? "Desactivar " : "Activar ") + inst.nombre);
    return [inst.nombre, inst.deporte, "$" + inst.precio,
            etiquetaEstado(inst.activa ? "confirmada" : "bloqueada", inst.activa ? "Activa" : "Inactiva"), b];
  });
  dibujarTabla("tabla-instalaciones", "Instalaciones y horarios", ["Nombre", "Deporte", "Precio/hora", "Estado", "Acción"], filas);
}

function pintarBloqueos() {
  const filas = bloqueos.map(function (b, indice) {
    const quitar = crearBoton("Quitar", "boton chico rojo", function () {
      bloqueos.splice(indice, 1);
      pintarBloqueos();
      mostrarMensaje("Bloqueo quitado.");
    }, "Quitar el bloqueo de " + buscarInstalacion(b.instalacionId).nombre + " a las " + b.hora);
    return [buscarInstalacion(b.instalacionId).nombre, formatoFecha(b.fecha), b.hora, b.motivo, quitar];
  });
  dibujarTabla("tabla-bloqueos", "Bloqueos de horario", ["Instalación", "Fecha", "Horario", "Motivo", "Acción"], filas, "No hay bloqueos.");
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
  dibujarTabla("tabla-reportes", "Reporte de reservas e ingresos por instalación", ["Instalación", "Reservas", "Asistidas", "Ingresos"], filas);
}

function pintarUsuarios() {
  const filas = usuarios.map(function (u, i) {
    const sel = document.createElement("select");
    sel.id = "rol-usuario-" + i;
    sel.setAttribute("aria-label", "Rol de " + u.nombre);
    ["Cliente", "Personal operativo", "Administrador"].forEach(function (r) { sel.appendChild(crear("option", r)); });
    sel.value = u.rol;
    sel.addEventListener("change", function () { u.rol = sel.value; mostrarMensaje("Rol de " + u.nombre + " cambiado a " + u.rol + "."); });
    return [u.nombre, u.correo, sel];
  });
  dibujarTabla("tabla-usuarios", "Usuarios y roles", ["Nombre", "Correo", "Rol"], filas);
}

// ---------- EVENTOS (se conectan una sola vez al cargar) ----------
// "Saltar al contenido": lleva el foco al contenido sin cambiar de pantalla
$("saltar").addEventListener("click", function (e) {
  e.preventDefault();
  $("contenido").focus();
});

// Botones que solo cambian de pantalla: tienen el atributo data-ir
document.querySelectorAll("[data-ir]").forEach(function (b) {
  b.addEventListener("click", function () { irA(b.dataset.ir); });
});

// Botones de "entrar como..."
document.querySelectorAll("[data-rol]").forEach(function (b) {
  b.addEventListener("click", function () { entrar(b.dataset.rol); });
});

// Casillas "Mostrar contraseña"
document.querySelectorAll("[data-mostrar]").forEach(function (c) {
  c.addEventListener("change", function () {
    $(c.dataset.mostrar).type = c.checked ? "text" : "password";
  });
});

// Formularios: se evita el envío real (preventDefault) y se valida
$("form-login").addEventListener("submit", function (e) {
  e.preventDefault();
  if (validarLogin()) entrar("cliente");
  else enfocarPrimerError($("form-login"));
});
$("form-registro").addEventListener("submit", function (e) {
  e.preventDefault();
  if (validarRegistro()) { entrar("cliente"); mostrarMensaje("Cuenta creada. ¡Bienvenida!"); }
  else enfocarPrimerError($("form-registro"));
});
$("form-modificar").addEventListener("submit", function (e) { e.preventDefault(); guardarModificacion(); });
$("form-perfil").addEventListener("submit", function (e) {
  e.preventDefault();
  if ($("perfil-nombre").value.trim() === "") { ponerError("perfil-nombre", "El nombre no puede estar vacío."); $("perfil-nombre").focus(); return; }
  ponerError("perfil-nombre", "");
  mostrarMensaje("Perfil guardado.");
});
$("form-presencial").addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = $("pres-nombre").value.trim();
  if (nombre === "") { ponerError("pres-nombre", "Escribe el nombre del cliente."); $("pres-nombre").focus(); return; }
  ponerError("pres-nombre", "");
  const id = Number($("pres-instalacion").value), hora = $("pres-hora").value;
  if (estadoHora(id, HOY, hora) !== "libre") { ponerError("pres-nombre", "Ese horario no está disponible. Elige otro."); $("pres-nombre").focus(); return; }
  reservas.push({ codigo: "SR-" + (20400 + reservas.length), cliente: nombre, instalacionId: id, fecha: HOY, hora: hora, estado: "asistida" });
  $("pres-nombre").value = "";
  mostrarMensaje("Reserva presencial registrada para " + nombre + ".");
});
$("form-bloqueo").addEventListener("submit", function (e) {
  e.preventDefault();
  const motivo = $("blq-motivo").value.trim();
  if (motivo === "") { ponerError("blq-motivo", "Escribe el motivo del bloqueo."); $("blq-motivo").focus(); return; }
  ponerError("blq-motivo", "");
  const id = Number($("blq-instalacion").value), hora = $("blq-hora").value;
  if (estadoHora(id, HOY, hora) !== "libre") { ponerError("blq-motivo", "Ese horario ya está ocupado o bloqueado."); $("blq-motivo").focus(); return; }
  bloqueos.push({ instalacionId: id, fecha: HOY, hora: hora, motivo: motivo });
  $("blq-motivo").value = "";
  pintarBloqueos();
  mostrarMensaje("Horario bloqueado.");
});

$("btn-confirmar").addEventListener("click", confirmarReserva);
$("filtro-deporte").addEventListener("change", pintarInstalaciones);
$("filtro-fecha").addEventListener("change", pintarInstalaciones);

// ---------- Opciones de accesibilidad: tema y tamaño del texto ----------
const temas = ["auto", "claro", "oscuro"];
const nombresTema = { auto: "Automático", claro: "Claro", oscuro: "Oscuro" };
const tamanos = [100, 115, 130, 150];          // porcentaje del tamaño de letra
let temaActual = "auto";
let tamanoActual = 0;                          // posición en el arreglo tamanos

function guardar(clave, valor) {               // si el navegador no deja guardar, no pasa nada
  try { localStorage.setItem(clave, valor); } catch (e) { }
}
function leer(clave) {
  try { return localStorage.getItem(clave); } catch (e) { return null; }
}

function aplicarTema(t) {
  temaActual = t;
  if (t === "auto") document.documentElement.removeAttribute("data-tema");
  else document.documentElement.setAttribute("data-tema", t);
  $("btn-tema").textContent = "Tema: " + nombresTema[t];
  guardar("sportres-tema", t);
}

function aplicarTamano(n) {
  tamanoActual = n;
  document.documentElement.style.fontSize = tamanos[n] + "%";
  $("btn-menos").disabled = (n === 0);
  $("btn-mas").disabled = (n === tamanos.length - 1);
  guardar("sportres-tamano", String(n));
}

$("btn-tema").addEventListener("click", function () {
  const siguiente = temas[(temas.indexOf(temaActual) + 1) % temas.length];
  aplicarTema(siguiente);
  $("anuncio").textContent = "";
  $("anuncio").textContent = "Tema " + nombresTema[siguiente];
});
$("btn-menos").addEventListener("click", function () { if (tamanoActual > 0) aplicarTamano(tamanoActual - 1); });
$("btn-mas").addEventListener("click", function () { if (tamanoActual < tamanos.length - 1) aplicarTamano(tamanoActual + 1); });

// Se recuerdan las opciones elegidas
const temaGuardado = leer("sportres-tema");
aplicarTema(temas.indexOf(temaGuardado) >= 0 ? temaGuardado : "auto");
const tamanoGuardado = Number(leer("sportres-tamano"));
aplicarTamano(tamanoGuardado >= 0 && tamanoGuardado < tamanos.length ? tamanoGuardado : 0);

// Pantalla inicial
history.replaceState(null, "", "#/login");
mostrar("login");
