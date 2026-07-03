from PIL import Image, ImageDraw, ImageFont
import math

# Configuracion de imagen
W, H = 1800, 2200
BG = "#FFFFFF"
img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Colores
C = {
    "app":     ("#3b1c8c", "#f0ebff"),
    "views":   ("#6d28d9", "#ede9fe"),
    "preload": ("#7c3aed", "#f5f3ff"),
    "main":    ("#1e3a5f", "#e8f0fe"),
    "handler": ("#a435f0", "#f5f0ff"),
    "mongo":   ("#2d8a4e", "#eafaf1"),
    "ext":     ("#b4690e", "#fef9e7"),
    "arrow":   "#6a6f73",
    "text":    "#1c1d1f",
    "subtext": "#6a6f73",
    "white":   "#FFFFFF",
    "border":  "#d1d7dc",
    "header":  "#3b1c8c",
}

def font(size, bold=False):
    try:
        if bold:
            return ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
        return ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
    except:
        return ImageFont.load_default()

def text_size(t, f):
    bbox = draw.textbbox((0, 0), t, font=f)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]

def round_rect(x, y, w, h, fill, outline=None, radius=10):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=fill, outline=outline, width=2)

def draw_box(x, y, w, h, title, subtitle, bg, border):
    round_rect(x, y, w, h, bg, border)
    tw, th = text_size(title, font(15, True))
    tx = x + (w - tw) // 2
    draw.text((tx, y + 14), title, fill="#1c1d1f", font=font(15, True))
    if subtitle:
        lines = subtitle.split("\n")
        ly = y + 38
        for line in lines:
            lw, lh = text_size(line, font(11))
            lx = x + (w - lw) // 2
            draw.text((lx, ly), line, fill="#6a6f73", font=font(11))
            ly += 16

def arrow(x1, y1, x2, y2, color="#6a6f73"):
    draw.line([(x1, y1), (x2, y2)], fill=color, width=2)
    # punta
    angle = math.atan2(y2 - y1, x2 - x1)
    size = 8
    draw.polygon([
        (x2, y2),
        (x2 - size * math.cos(angle - 0.4), y2 - size * math.sin(angle - 0.4)),
        (x2 - size * math.cos(angle + 0.4), y2 - size * math.sin(angle + 0.4)),
    ], fill=color)

def arrow_left(x1, y1, x2, y2, color="#6a6f73"):
    draw.line([(x1, y1), (x2, y2)], fill=color, width=2)
    angle = math.atan2(y2 - y1, x2 - x1)
    size = 8
    draw.polygon([
        (x2, y2),
        (x2 - size * math.cos(angle - 0.4), y2 - size * math.sin(angle - 0.4)),
        (x2 - size * math.cos(angle + 0.4), y2 - size * math.sin(angle + 0.4)),
    ], fill=color)

def section_border(x, y, w, h, label, color, bg):
    round_rect(x, y, w, h, bg, color, radius=8)
    lw, lh = text_size(label, font(13, True))
    # fondo para el label
    draw.rounded_rectangle([x + 10, y - 10, x + 10 + lw + 16, y + 14], radius=5, fill=color)
    draw.text((x + 18, y - 9), label, fill="#FFFFFF", font=font(13, True))

# ============================================================
# TITULO
# ============================================================
draw.text((60, 25), "EduPlatform — Diagrama de Arquitectura", fill="#3b1c8c", font=font(28, True))
draw.text((60, 62), "Electron + React + MongoDB  |  Caso 3", fill="#6a6f73", font=font(14))
draw.line([(60, 88), (W - 60, 88)], fill="#d1d7dc", width=1)

# ============================================================
# RENDERER PROCESS
# ============================================================
section_border(60, 105, 820, 520, "RENDERER PROCESS (React + Vite)", C["views"][0], "#fafafe")

draw_box(90, 140, 230, 50, "app.jsx", "Estado global\ncurrentUser / activeNav", C["app"][1], C["app"][0])

# Vistas
vw, vh = 170, 75
vx = 90
vys = [230, 320, 410, 500]
titles = ["LoginRegister.jsx", "Catalog.jsx", "MyLearning.jsx", "Lesson.jsx"]
subtitles = [
    "Vista 1: Login\nauth:login / register",
    "Vista 2: Catalogo\nFiltro + Busqueda + Conversor",
    "Vista 3: Mi Aprendizaje\nTabla + Progreso + Continuar",
    "Vista 4: Leccion\nVideo + Markdown + Comentarios",
]
colors = ["#ede9fe", "#f0ebff", "#f5f3ff", "#ede9fe"]

for i, (t, s) in enumerate(zip(titles, subtitles)):
    draw_box(vx, vys[i], vw, vh, t, s, colors[i], "#7c3aed")

# Sidebar / Topbar
draw_box(280, 140, 200, 50, "Shell (componentes)", "Sidebar + Topbar + Icons", "#f7f9fa", "#6a6f73")

# Instructor Dashboard
draw_box(280, 500, 200, 75, "InstructorDashboard.jsx", "Panel instructor\nestudiantes + progreso", "#e8f0fe", "#1e3a5f")

# window.api.invoke
draw_box(500, 230, 360, 60, "window.api.invoke('canal', args)", "Llamadas IPC al proceso main", "#f5f0ff", "#a435f0")

# Flechas internas renderer
arrow(205, 190, 205, 230, "#6a6f73")        # app -> vistas
arrow(280, 325, 500, 260, "#a435f0")        # catalog -> invoke
arrow(380, 500, 500, 260, "#a435f0")        # instructor -> invoke

# ============================================================
# PRELOAD
# ============================================================
section_border(60, 650, 820, 90, "PRELOAD (puente seguro)", C["preload"][0], "#f5f0ff")

draw_box(90, 680, 350, 40, "Whitelist IPC: 12 canales", "auth:*  curso:*  leccion:*  instructor:*  db:*", "#f5f0ff", "#7c3aed")
draw_box(470, 680, 380, 40, "Canal no listado?", "Promise.reject('Canal IPC no permitido')", "#fef9e7", "#b4690e")

# Flechas renderer -> preload
arrow(680, 290, 680, 650, "#a435f0")

# ============================================================
# MAIN PROCESS
# ============================================================
section_border(940, 105, 800, 520, "MAIN PROCESS (Electron)", C["main"][0], "#f8fbff")

draw_box(970, 140, 220, 50, "index.js", "CSP + UserAgent + Ventana", "#e8f0fe", "#1e3a5f")
draw_box(1210, 140, 220, 50, "session.js", "usuarioActual\n(identidad del main)", "#e8f0fe", "#1e3a5f")
draw_box(1450, 140, 260, 50, "connection.js", "Mongoose -> MongoDB", "#e8f0fe", "#1e3a5f")

# Handlers
hw = 200
hx = 970
hys = [220, 310, 400, 490]
htitles = ["authHandlers", "courseHandlers", "learningHandlers", "lessonHandlers"]
hsubs = [
    "auth:login\nauth:register\nauth:logout",
    "curso:listar\nresolver instructor",
    "aprendizaje:listar\ninscripcion:crear",
    "leccion:obtener\nleccion:completar\ncomentario:listar/crear",
]

for i, (t, s) in enumerate(zip(htitles, hsubs)):
    draw_box(hx, hys[i], hw, 75, t, s, "#f5f0ff", "#a435f0")

# instructorHandlers
draw_box(1200, 490, 220, 50, "instructorHandlers", "instructor:resumen", "#f5f0ff", "#a435f0")
# dbHandlers
draw_box(1440, 490, 200, 50, "dbHandlers", "db:estado", "#f5f0ff", "#a435f0")

# Flechas internas main
arrow(1080, 190, 1080, 220, "#1e3a5f")    # index -> handlers
arrow(1180, 165, 1180, 220, "#1e3a5f")    # session area
arrow(1580, 190, 1580, 220, "#1e3a5f")    # connection

# ============================================================
# PRELOAD -> MAIN
# ============================================================
arrow(680, 720, 680, 780, "#7c3aed")
arrow(680, 780, 970, 780, "#7c3aed")
arrow(970, 780, 970, 530, "#a435f0")

# ============================================================
# MONGODB
# ============================================================
section_border(60, 780, 820, 420, "MONGODB (eduplatform)", C["mongo"][0], "#f2fdf6")

draw_box(90, 815, 240, 55, "usuarios", "nombre, email, password\ntipo: estudiante | instructor", "#eafaf1", "#2d8a4e")
draw_box(350, 815, 240, 55, "cursos", "nombre, instructor_id\nprecio, calificacion", "#eafaf1", "#2d8a4e")
draw_box(610, 815, 240, 55, "lecciones", "curso_id, titulo\nvideo_url, contenido_text", "#eafaf1", "#2d8a4e")

draw_box(90, 900, 240, 55, "inscripciones", "usuario_id, curso_id\nprogreso, lecciones_completadas", "#eafaf1", "#2d8a4e")
draw_box(350, 900, 240, 55, "comentarios", "leccion_id, usuario_id\ntexto, fecha", "#eafaf1", "#2d8a4e")

# Flechas handlers -> mongo
arrow(1070, 565, 210, 780, "#2d8a4e")

# ============================================================
# SERVICIOS EXTERNOS
# ============================================================
section_border(940, 650, 800, 90, "SERVICIOS EXTERNOS", C["ext"][0], "#fefcf3")

draw_box(970, 680, 240, 40, "open.er-api.com", "Tasas de cambio", "#fef9e7", "#b4690e")
draw_box(1230, 680, 240, 40, "YouTube (iframe)", "Video embed", "#fef9e7", "#b4690e")
draw_box(1490, 680, 250, 40, "Unsplash + Google Fonts", "Portadas + Inter", "#fef9e7", "#b4690e")

# ============================================================
# FLUJO INSERCION SIN SESION
# ============================================================
y_flow = 1250
draw.line([(60, y_flow), (W - 60, y_flow)], fill="#d1d7dc", width=1)
draw.text((60, y_flow + 8), "FLUJO: Inscripcion sin sesion", fill="#3b1c8c", font=font(20, True))

# Cajas del flujo
bx = 80
bw = 180
bh = 50
by = y_flow + 50

flow_labels = [
    "Click\nInscribirse\n(sin login)",
    "onRequireLogin()\nGuarda\npendingCourseId",
    "requireLogin()\nshowLogin = true",
    "LoginRegister\nVista 1:\nLogin",
    "handleLoginSuccess()\nsetUser\nnav learning",
    "enrollCourse()\ninscripcion:crear\nen MongoDB",
    "Mi Aprendizaje\nNavega a\nVista 3",
]

for i, lab in enumerate(flow_labels):
    x = bx + i * (bw + 20)
    draw_box(x, by, bw, bh, lab, None, "#ede9fe", "#7c3aed")
    if i < len(flow_labels) - 1:
        arrow(x + bw, by + bh // 2, x + bw + 20, by + bh // 2, "#a435f0")

# ============================================================
# FLUJO COMPLETAR LECCION
# ============================================================
y2 = y_flow + 200
draw.line([(60, y2), (W - 60, y2)], fill="#d1d7dc", width=1)
draw.text((60, y2 + 8), "FLUJO: Marcar leccion completada", fill="#3b1c8c", font=font(20, True))

flow2 = [
    "Click\nCompletar",
    "leccion:completar\nHandler",
    "Buscar\ninscripcion\nen MongoDB",
    "addToSet\nlecciones_\ncompletadas",
    "Recalcular\nprogreso\ncompletadas/total",
    "Actualizar\ninscripcion\ncon progreso",
    "UI actualiza\nbarra de\nprogreso",
]

for i, lab in enumerate(flow2):
    x = bx + i * (bw + 20)
    draw_box(x, y2 + 50, bw, bh, lab, None, "#e8f0fe", "#1e3a5f")
    if i < len(flow2) - 1:
        arrow(x + bw, y2 + 50 + bh // 2, x + bw + 20, y2 + 50 + bh // 2, "#1e3a5f")

# ============================================================
# SEGURIDAD: CAPAS
# ============================================================
y3 = y2 + 200
draw.line([(60, y3), (W - 60, y3)], fill="#d1d7dc", width=1)
draw.text((60, y3 + 8), "SEGURIDAD: Capas de proteccion", fill="#3b1c8c", font=font(20, True))

sec = [
    ("contextIsolation: true", "Renderer no accede\na node modules", "#3b1c8c"),
    ("nodeIntegration: false", "Sin require,\nfs, path, etc.", "#3b1c8c"),
    ("Whitelist IPC", "Solo 12 canales\nconocidos", "#a435f0"),
    ("CSP por sesion", "Dominios permitidos:\nfonts, unsplash, api", "#7c3aed"),
    ("Session.js", "Identidad del main,\nno del renderer", "#1e3a5f"),
]

for i, (t, s, c) in enumerate(sec):
    x = bx + i * (bw + 20)
    draw_box(x, y3 + 45, bw, 65, t, s, "#f0ebff", c)

# ============================================================
# NOTA AL PIE
# ============================================================
draw.text((60, H - 35), "EduPlatform Caso 3  |  Julio 2026  |  Archivo: docs/diagrama.png", fill="#9ba0a6", font=font(11))

# Guardar
out = "C:/Users/Jean/OneDrive/Escritorio/VSCode/EduPlataform/docs/diagrama.png"
img.save(out, "PNG", quality=95)
print(f"Imagen generada: {out}")
print(f"Tamano: {W}x{H}")
