# dev-css — Refactorización CSS Óptima

## Propósito
Refactorizar CSS para hacerlo óptimo, eliminando redundancias y maximizando la reutilización siguiendo principios DRY.

## Principios
1. **DRY (Don't Repeat Yourself)** — Cada patrón visual una sola vez
2. **Tokens primero** — Usar `var(--token)` siempre, nunca valores hardcodeados
3. **Composición sobre copia** — Clases utilitarias compartidas en vez de repetir declaraciones
4. **BEM consistente** — Mantener `bloque__elemento--modificador`
5. **Responsive centralizado** — Breakpoints consistentes, no mágicos

## Checklist de Diagnóstico

- [ ] Colores hardcodeados que duplican `var(--color-*)` en CSS y JSX
- [ ] Barras de progreso, botones, cards, badges duplicados entre archivos
- [ ] Mismas declaraciones de `border`, `border-radius`, `background` repetidas en múltiples clases
- [ ] Breakpoints inconsistentes (distintos valores para el mismo propósito)
- [ ] Animaciones definidas inline en vez de usar las de `index.css`
- [ ] Mensajes de estado (`.msg`, `.msg--error`) definidos por archivo en vez de compartidos

## Workflow

### 1. Auditoría
Identificar patrones repetidos entre todos los archivos CSS del proyecto.

### 2. Unificar Tokens
Asegurar que `index.css` contenga todas las variables necesarias. Reemplazar valores hardcodeados en JSX (Tailwind `bg-[#...]`, `text-[#...]`) con referencias a `var(--color-*)`.

### 3. Extraer Shared Utilities
En `index.css` o un archivo compartido, crear clases reutilizables:

| Utilidad | Propósito |
|----------|-----------|
| `.surface` | Card/container base (bg, border, radius) |
| `.btn`, `.btn--primary`, `.btn--ghost` | Sistema de botones |
| `.progress-track`, `.progress-fill` | Barra de progreso |
| `.msg`, `.msg--error` | Mensajes de estado |
| `.badge`, `.badge--success` | Badges/píldoras |
| `.text-muted` | Texto secundario |
| `.truncate-2` | Texto truncado a 2 líneas |

### 4. Consolidar Componentes
Refactorizar cada archivo CSS para usar las utilidades compartidas en vez de redefinir.

### 5. Limpiar
Eliminar código muerto, comentarios obsoletos, selectores no utilizados.

## Patrones Comunes a Aplicar

```css
/* Antes (repetido en 4 archivos) */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

/* Después (una vez en index.css) */
.surface {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
```

```css
/* Antes (hardcodeado en JSX) */
className="bg-[#3b1c8c] text-white"

/* Después */
className="bg-primary text-white"
```

## Verificación
- `git diff --stat` para ver líneas eliminadas vs añadidas
- Cargar la app y verificar que no haya cambios visuales
- `npm run build` sin errores
