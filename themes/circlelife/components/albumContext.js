import { createContext, useCallback, useContext, useMemo, useRef } from 'react'

/**
 * 影集 UI 桥
 *
 * MenuItemDrop 在影集页点「影集」时不重新进路由，而是通过本 Context
 * 调 AlbumReader 的 openIndex，打开目录抽屉。
 */
const AlbumUIContext = createContext(null)

export function AlbumUIProvider({ children }) {
  const openAlbumIndexRef = useRef(null)

  const registerAlbumIndex = useCallback(fn => {
    openAlbumIndexRef.current = fn || null
  }, [])

  const openAlbumIndex = useCallback(() => {
    openAlbumIndexRef.current?.()
  }, [])

  const value = useMemo(
    () => ({ registerAlbumIndex, openAlbumIndex }),
    [registerAlbumIndex, openAlbumIndex]
  )

  return (
    <AlbumUIContext.Provider value={value}>{children}</AlbumUIContext.Provider>
  )
}

export function useAlbumUI() {
  return useContext(AlbumUIContext)
}
