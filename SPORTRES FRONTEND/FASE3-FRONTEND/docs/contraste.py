"""Verifica el contraste (WCAG 2.1 AA) de los colores de SportRes.
Lee las variables de estilos.css (tema claro y tema oscuro) y calcula cada par.
Uso:  python3 contraste.py ../estilos.css
Mínimos: texto normal 4.5:1 · componentes de interfaz y foco 3:1."""
import re, sys

ruta = sys.argv[1] if len(sys.argv) > 1 else "estilos.css"
css = open(ruta, encoding="utf-8").read()

def bloque(inicio):
    i = css.index(inicio)
    j = css.index("}", i)
    return dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})", css[i:j]))

temas = {
    "CLARO": bloque(":root {"),
    "OSCURO": bloque(':root[data-tema="oscuro"] {'),
}
# el tema oscuro hereda del claro lo que no redefine
temas["OSCURO"] = {**temas["CLARO"], **temas["OSCURO"]}

def lum(h):
    h = h.lstrip("#")
    c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])

def ratio(a, b):
    la, lb = lum(a), lum(b)
    if la < lb: la, lb = lb, la
    return (la + 0.05) / (lb + 0.05)

# (descripción, texto o componente, fondo, mínimo)  — los nombres son variables del CSS o colores fijos
pares = [
    ("Texto principal sobre el fondo", "texto", "fondo", 4.5),
    ("Texto principal sobre tarjetas", "texto", "superficie", 4.5),
    ("Texto secundario sobre el fondo", "gris", "fondo", 4.5),
    ("Texto secundario sobre tarjetas", "gris", "superficie", 4.5),
    ("Texto del encabezado", "on-header", "header", 4.5),
    ("Texto de botón principal", "on-primario", "primario", 4.5),
    ("Botón secundario / enlaces / horarios", "enlace", "superficie", 4.5),
    ("Texto verde sobre el fondo", "enlace", "fondo", 4.5),
    ("Texto sobre fondo suave (tabla, menú activo)", "on-suave", "suave", 4.5),
    ("Títulos del menú lateral", "enlace", "superficie", 4.5),
    ("Errores y botón Cancelar", "rojo", "superficie", 4.5),
    ("Error dentro del campo", "rojo", "rojo-fondo", 4.5),
    ("Estado Confirmada / Libre", "ok-tx", "ok-bg", 4.5),
    ("Estado Pendiente", "pend-tx", "pend-bg", 4.5),
    ("Estado Cancelada / Ocupada", "mal-tx", "mal-bg", 4.5),
    ("Estado Asistida / Bloqueada", "neutro-tx", "neutro-bg", 4.5),
    ("Horario no disponible", "nodisp-tx", "nodisp-bg", 4.5),
    ("Mensajes de aviso", "texto", "aviso", 4.5),
    ("Paso actual (texto blanco)", "#ffffff", "paso-activo", 4.5),
    ("Texto de campo", "texto", "superficie", 4.5),
    ("Borde de campo (componente)", "borde-campo", "superficie", 3.0),
    ("Borde de botón secundario (componente)", "enlace", "superficie", 3.0),
    ("Anillo de foco sobre el fondo", "foco", "fondo", 3.0),
    ("Anillo de foco sobre tarjetas", "foco", "superficie", 3.0),
    ("Menú activo del encabezado", "#083d2e", "#ffffff", 4.5),
    ("Foco sobre el encabezado", "#ffd54a", "header", 3.0),
    ("Banner (texto blanco, extremo más claro)", "#ffffff", "#0b6246", 4.5),
]

def valor(v, t):
    return v if v.startswith("#") else t[v]

total = fallas = 0
for nombre, t in temas.items():
    print(f"\n=== TEMA {nombre} ===")
    for desc, a, b, minimo in pares:
        ca, cb = valor(a, t), valor(b, t)
        r = ratio(ca, cb)
        ok = r >= minimo
        total += 1; fallas += (not ok)
        print(f"{'OK   ' if ok else 'FALLA'} {r:5.2f}:1 (mín {minimo})  {desc}  [{ca} sobre {cb}]")
print(f"\nPares revisados: {total} · Fallas: {fallas}")
sys.exit(1 if fallas else 0)
