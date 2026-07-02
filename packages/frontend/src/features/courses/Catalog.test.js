import { describe, it, expect } from 'vitest'
import { formatearPrecio, portadaDeCurso } from './Catalog.jsx'

describe('formatearPrecio', () => {
  it('devuelve "Sin precio" cuando el precio es null o undefined', () => {
    expect(formatearPrecio(null, 'USD', {})).toBe('Sin precio')
    expect(formatearPrecio(undefined, 'USD', {})).toBe('Sin precio')
  })

  it('cae a USD con dos decimales si no hay tasa para la moneda', () => {
    expect(formatearPrecio(49.99, 'EUR', {})).toBe('49.99 USD')
  })

  it('formatea en la moneda pedida cuando hay tasa', () => {
    const salida = formatearPrecio(10, 'USD', {})
    expect(typeof salida).toBe('string')
    expect(salida).toMatch(/10/)
  })

  it('aplica la tasa de cambio al convertir', () => {
    const salida = formatearPrecio(10, 'CLP', { CLP: 900 })
    expect(salida).toMatch(/9[.,]?000/)
  })
})

describe('portadaDeCurso', () => {
  it('omite la palabra de nivel al construir monograma y tema', () => {
    const p = portadaDeCurso('React Avanzado')
    expect(p.iniciales).toBe('RE')
    expect(p.tema).toBe('React')
  })

  it('toma iniciales de varias palabras significativas', () => {
    expect(portadaDeCurso('Python Machine Learning').iniciales).toBe('PM')
  })

  it('es determinista: el mismo nombre da el mismo gradiente e imagen', () => {
    const a = portadaDeCurso('MongoDB Mastery')
    const b = portadaDeCurso('MongoDB Mastery')
    expect(a.gradiente).toBe(b.gradiente)
    expect(a.imagen).toBe(b.imagen)
    expect(a.gradiente).toMatch(/^linear-gradient/)
    expect(a.imagen).toContain('images.unsplash.com')
  })

  it('maneja nombre vacio sin romper', () => {
    const p = portadaDeCurso('')
    expect(p.iniciales).toBe('?')
    expect(p.tema).toBe('')
  })
})
