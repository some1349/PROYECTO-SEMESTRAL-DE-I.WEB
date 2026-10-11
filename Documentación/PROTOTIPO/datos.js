// ===== DATOS DE EJEMPLO (arreglos de objetos) =====
// En el sistema real vendrían de una base de datos.

const HOY = "2026-10-15";
const HORAS = ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];

const instalaciones = [
  { id: 1, nombre: "Cancha Fútbol 5 · A", deporte: "Fútbol", precio: 25, capacidad: 10, activa: true },
  { id: 2, nombre: "Baloncesto Central", deporte: "Baloncesto", precio: 18, capacidad: 10, activa: true },
  { id: 3, nombre: "Pádel Norte 1", deporte: "Pádel", precio: 30, capacidad: 4, activa: true },
  { id: 4, nombre: "Cancha Fútbol 7", deporte: "Fútbol", precio: 40, capacidad: 14, activa: false }
];

// estado: confirmada, asistida o cancelada
const reservas = [
  { codigo: "SR-20481", cliente: "Ana Pérez", instalacionId: 1, fecha: HOY, hora: "16:00", estado: "confirmada" },
  { codigo: "SR-20112", cliente: "Ana Pérez", instalacionId: 3, fecha: "2026-10-20", hora: "19:00", estado: "confirmada" },
  { codigo: "SR-19873", cliente: "Ana Pérez", instalacionId: 2, fecha: "2026-10-02", hora: "18:00", estado: "asistida" },
  { codigo: "SR-19540", cliente: "Ana Pérez", instalacionId: 4, fecha: "2026-09-28", hora: "10:00", estado: "cancelada" },
  { codigo: "SR-20300", cliente: "Carlos Ruiz", instalacionId: 1, fecha: HOY, hora: "09:00", estado: "asistida" },
  { codigo: "SR-20390", cliente: "Sofía Mora", instalacionId: 3, fecha: HOY, hora: "19:00", estado: "confirmada" },
  { codigo: "SR-20391", cliente: "Pedro Vega", instalacionId: 2, fecha: HOY, hora: "17:00", estado: "confirmada" }
];

const bloqueos = [
  { instalacionId: 1, fecha: HOY, hora: "19:00", motivo: "Mantenimiento" }
];

const usuarios = [
  { nombre: "Ana Pérez", correo: "ana@ejemplo.com", rol: "Cliente" },
  { nombre: "Luis Gómez", correo: "luis@sportres.com", rol: "Personal operativo" },
  { nombre: "María Díaz", correo: "maria@sportres.com", rol: "Administrador" }
];

// Menú de cada rol: [pantalla, texto]
const menus = {
  cliente: [["buscar", "Buscar instalaciones"], ["mis-reservas", "Mis reservas"], ["perfil", "Mi perfil"]],
  operativo: [["op-dia", "Reservas del día"], ["presencial", "Reserva presencial"], ["disponibilidad", "Disponibilidad"]],
  admin: [["a-panel", "Panel"], ["a-instalaciones", "Instalaciones y horarios"],
          ["a-reportes", "Reportes"], ["a-usuarios", "Usuarios y roles"]]
};
const nombresRol = { cliente: "Cliente: Ana Pérez", operativo: "Personal: Luis Gómez", admin: "Administrador: María Díaz" };

// Nombre de cada pantalla (para la ruta de migas de pan)
const titulos = {
  "login": "Inicio", "registro": "Inicio › Registro", "buscar": "Inicio › Buscar instalaciones",
  "detalle": "Inicio › Buscar instalaciones › Detalle", "confirmar": "Inicio › Buscar instalaciones › Detalle › Confirmar",
  "exito": "Inicio › Reserva confirmada", "mis-reservas": "Inicio › Mis reservas", "modificar": "Inicio › Mis reservas › Modificar",
  "perfil": "Inicio › Mi perfil", "op-dia": "Panel operativo › Reservas del día", "presencial": "Panel operativo › Reserva presencial",
  "disponibilidad": "Panel operativo › Disponibilidad", "a-panel": "Panel administrador › Inicio",
  "a-instalaciones": "Panel administrador › Instalaciones y horarios", "a-bloqueos": "Panel administrador › Bloqueos",
  "a-reportes": "Panel administrador › Reportes", "a-usuarios": "Panel administrador › Usuarios y roles"
};

// Lo que el usuario va eligiendo mientras reserva
const seleccion = { rol: null, instalacionId: null, hora: null, codigoEditando: null };
