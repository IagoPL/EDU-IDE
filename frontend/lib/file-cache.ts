/**
 * Servicio de caché para archivos
 * Mejora el rendimiento evitando lecturas repetidas del servidor
 */

interface CacheEntry {
  content: string
  timestamp: number
  language: string
}

class FileCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxAge: number = 5 * 60 * 1000 // 5 minutos
  private maxSize: number = 100 // Máximo 100 archivos en caché

  /**
   * Obtener archivo de la caché
   */
  get(path: string): CacheEntry | null {
    const entry = this.cache.get(path)
    
    if (!entry) {
      return null
    }

    // Verificar si la entrada expiró
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(path)
      return null
    }

    return entry
  }

  /**
   * Guardar archivo en la caché
   */
  set(path: string, content: string, language: string): void {
    // Si la caché está llena, eliminar la entrada más antigua
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
      this.cache.delete(oldestKey)
    }

    this.cache.set(path, {
      content,
      language,
      timestamp: Date.now(),
    })
  }

  /**
   * Invalidar entrada específica
   */
  invalidate(path: string): void {
    this.cache.delete(path)
  }

  /**
   * Invalidar entradas que coincidan con un patrón
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Limpiar toda la caché
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Obtener estadísticas de la caché
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.keys()),
    }
  }

  /**
   * Actualizar contenido en caché sin invalidar
   */
  update(path: string, content: string): void {
    const entry = this.cache.get(path)
    if (entry) {
      this.cache.set(path, {
        ...entry,
        content,
        timestamp: Date.now(),
      })
    }
  }
}

// Exportar instancia singleton
export const fileCache = new FileCache()

