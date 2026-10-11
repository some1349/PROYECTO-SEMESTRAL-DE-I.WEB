# SportRes

**Sistema web para reservas de canchas e instalaciones deportivas**

Proyecto semestral de la materia **Ingeniería Web** (Licenciatura en Ingeniería de Software, Facultad de Ingeniería de Sistemas Computacionales, Universidad Tecnológica de Panamá).

- **Profesora:** Elba Valderrama Bahomóndez
- **Grupo:** 1SF133 (Grupo 2)
- **Semestre:** II Semestre, 2026

## Integrantes

| Nombre | Cédula |
|---|---|
| Analia Castillo | 8-1044-2072 |
| Felix Chung | 8-1035-1686 |
| Alexis He | 8-1032-619 |
| Liyi He | 8-1010-1496 |

## Descripción

SportRes es una plataforma web que centraliza la consulta y la reserva de canchas e instalaciones deportivas. Busca resolver los problemas de la reserva manual (llamadas, mensajes o visitas): dobles reservas, falta de visibilidad de la disponibilidad y poco control para quienes administran las instalaciones.

Tiene tres tipos de usuario:

- **Cliente:** busca instalaciones, consulta la disponibilidad y crea, cancela o modifica sus reservas.
- **Personal operativo:** consulta las reservas del día, confirma el check-in del cliente y registra reservas presenciales.
- **Administrador:** gestiona instalaciones, horarios, tarifas y bloqueos por mantenimiento, genera reportes de ocupación e ingresos, gestiona usuarios y roles, y puede hacer todo lo que hace el personal operativo.

## Estructura del repositorio

```
.
├── Documentación/   Entregables de cada fase (documentos en PDF)
├── Prototipo/       Prototipo navegable de la Fase 2 (HTML, CSS y JavaScript)
├── Autoría/         Anexo de autoría y uso de la IA
└── README.md
```

## Estado del proyecto

### Mini-avance (entregado)

Descripción del proyecto, identificación de usuarios, requisitos funcionales, requisitos no funcionales y escenarios de uso.

### Fase 1: Definición, requisitos y modelado web

El documento de la Fase 1 contiene:

1. Descripción del proyecto
2. Identificación de usuarios
3. Requisitos funcionales (RF-01 a RF-14)
4. Requisitos no funcionales (RNF-01 a RNF-07)
5. Escenarios de uso (7 escenarios)
6. Casos de uso: actores, diagrama y descripción de los 9 casos principales
7. Modelo de clases
8. Modelo de navegación inicial
9. Matriz de trazabilidad (objetivos, requisitos funcionales, usuario, escenarios, casos de uso y clases)

### Fase 2: Propuesta de interfaz y navegación

El documento de la Fase 2 contiene:

1. Arquitectura de información: contenido principal, agrupaciones y categorías, jerarquía, sistema de etiquetas y mecanismos de acceso
2. Sitemap
3. Navegación refinada: tipos de navegación, menús por rol, modelo de navegación y reglas
4. Flujos de navegación (6 recorridos de las tareas principales)
5. Wireframes (15 pantallas)
6. Prototipo: acceso, lineamientos visuales y pantallas principales (escritorio y móvil)

#### Prototipo

El prototipo está en la carpeta `Prototipo`, hecho solo con HTML, CSS y JavaScript, sin librerías ni servidor:

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de todas las pantallas |
| `estilos.css` | Diseño: Flexbox, CSS Grid y diseño responsivo |
| `datos.js` | Datos de ejemplo (instalaciones, reservas, usuarios y menús) |
| `app.js` | Lógica: navegación entre pantallas, menús por rol, validación de formularios y acciones |

Para usarlo, abre `index.html` en cualquier navegador. Desde la primera pantalla se puede entrar como **Cliente**, **Personal operativo** o **Administrador**. Los datos son de ejemplo y se reinician al recargar la página.

El anexo de **Autoría e IA** (tabla de aportes individuales, uso de la IA y prompts más relevantes) está en la carpeta `Autoría`.

## Uso de la inteligencia artificial

Se usaron herramientas de IA generativa (Claude, DeepSeek y Gemini) como apoyo en la redacción y estructuración. Todo el contenido fue revisado, validado y adaptado por el equipo. El detalle, con los links de las conversaciones, está en el anexo de la carpeta `Autoría`.
