# Centro de Documentación — EduPlataform

Guía centralizada de la documentación del proyecto. Solo se listan archivos que existen.

---

## Por dónde empezar

**Soy nuevo en el proyecto**
1. [SETUP_INICIAL.md](SETUP_INICIAL.md) — instalación y primeros pasos
2. [ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md) — layout del monorepo

**Quiero contribuir código**
1. [REGLAS_COLABORACION.md](REGLAS_COLABORACION.md) — git workflow y normas
2. [AUTH_GUIDE.md](AUTH_GUIDE.md) — ejemplo de módulo (autenticación)

**Me interesa la seguridad**
1. [../SECURITY.md](../SECURITY.md) — política y vulnerabilidades conocidas

**Necesito revisar problemas conocidos**
1. [../informe QA.md](../informe%20QA.md) — bugs y malas prácticas

---

## Documentos disponibles

| Documento | Propósito |
|---|---|
| [SETUP_INICIAL.md](SETUP_INICIAL.md) | Instalación, variables de entorno, puntos de entrada |
| [ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md) | Estructura del monorepo y decisiones de diseño |
| [AUTH_GUIDE.md](AUTH_GUIDE.md) | Sistema de login/register vía IPC |
| [REGLAS_COLABORACION.md](REGLAS_COLABORACION.md) | Git workflow, commits, PRs, CI |
| [../README.md](../README.md) | Visión general del proyecto |
| [../SECURITY.md](../SECURITY.md) | Política de seguridad y vulnerabilidades |
| [../informe QA.md](../informe%20QA.md) | Problemas conocidos y deuda técnica |
| [../TAREAS.md](../TAREAS.md) | Backlog de tareas del equipo |

---

## Material del caso (fuente de verdad del requerimiento)

El enunciado y los datos del ejercicio están en `docs/EduPlatform/`:

| Archivo | Qué es |
|---|---|
| `CASO_3_EduPlatform_Requerimientos_Frontend.pdf` | Requerimientos: 4 vistas (Login, Catálogo, Mi Aprendizaje, Lección) + conversor de monedas |
| `playground-1.mongodb.js` | Playground de MongoDB |

> Importante: ante cualquier discrepancia entre la documentación interna y el material del
> caso, manda el material del caso. Los datos de prueba reales (con problemas de integridad
> intencionales: instructor/curso/lección huérfanos) están en el seed `CASO_3_EduPlatform_mongodb_existente.js`.

---

## Mapa del repositorio

```
EduPlataform/
├─ Documentación
│  ├─ README.md ........................ Visión general
│  ├─ SECURITY.md ..................... Seguridad
│  ├─ informe QA.md ................... Problemas conocidos
│  ├─ TAREAS.md ....................... Backlog
│  └─ docs/
│     ├─ DOCUMENTACION.md ............. Este archivo (índice)
│     ├─ SETUP_INICIAL.md ............. Instalación
│     ├─ ESTRUCTURA_PROYECTO.md ....... Estructura
│     ├─ AUTH_GUIDE.md ................ Autenticación
│     ├─ REGLAS_COLABORACION.md ....... Normas de equipo
│     └─ EduPlatform/ ................. Material del Caso 3
├─ Código
│  ├─ packages/frontend/ ............. UI React
│  ├─ packages/main/ ................. Electron IPC (pseudo-backend)
│  └─ packages/shared/ ............... Constantes IPC compartidas
└─ Build & Deploy
   ├─ dist-gh/ ....................... Build para GitHub Pages
   └─ package.json ................... Scripts npm (workspaces)
```

---

## Checklist antes de commitear

- [ ] El código cumple [REGLAS_COLABORACION.md](REGLAS_COLABORACION.md)
- [ ] No introduces vulnerabilidades (ver [../SECURITY.md](../SECURITY.md))
- [ ] `npm run format && npm run lint` sin errores
- [ ] Si cambias la estructura, actualizas [ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md)
- [ ] Si la documentación referencia un archivo, ese archivo existe

---

**Mantenedor**: EduPlataform Team
