"use client"

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'eduide-recent-folders'
const MAX_RECENT_FOLDERS = 10

export interface RecentFolder {
  path: string
  name: string
  lastOpened: number
}

export function useRecentFolders() {
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([])

  // Cargar carpetas recientes del localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentFolders(parsed)
      } catch (error) {
        console.error('Error loading recent folders:', error)
        setRecentFolders([])
      }
    }
  }, [])

  // Guardar en localStorage cuando cambie
  const saveToStorage = (folders: RecentFolder[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
    setRecentFolders(folders)
  }

  // Agregar carpeta al historial
  const addRecentFolder = (path: string) => {
    // Extraer el nombre de la carpeta del path
    const name = path.split(/[\\/]/).filter(Boolean).pop() || path

    const newFolder: RecentFolder = {
      path,
      name,
      lastOpened: Date.now()
    }

    // Eliminar duplicados y agregar al inicio
    const filtered = recentFolders.filter(f => f.path !== path)
    const updated = [newFolder, ...filtered].slice(0, MAX_RECENT_FOLDERS)
    
    saveToStorage(updated)
  }

  // Eliminar carpeta del historial
  const removeRecentFolder = (path: string) => {
    const updated = recentFolders.filter(f => f.path !== path)
    saveToStorage(updated)
  }

  // Limpiar historial
  const clearRecentFolders = () => {
    saveToStorage([])
  }

  return {
    recentFolders,
    addRecentFolder,
    removeRecentFolder,
    clearRecentFolders
  }
}

