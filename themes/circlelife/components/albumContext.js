import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

/**
 * 影集 UI 桥
 *
 * Header（滚动收起需要画廊滚动根）与 MenuItemDrop（点「影集」回书架）
 * 通过本 Context 与 AlbumStage 通信，替代原先的 window CustomEvent
 * （cl-album-view / cl-album-go-shelf / cl-album-scrollroot）与
 * Header 里的 querySelector 反查 + 定时器兜底。
 *
 * Provider 挂在 LayoutBase 顶层，全站常驻：非影集页 scrollRoot 恒为
 * null，Header 自动回退 window 滚动。
 */
const AlbumUIContext = createContext(null)

export function AlbumUIProvider({ children }) {
  // 画廊滚动根（.cl-album-snap 元素）；null = 非画廊态
  const [scrollRoot, setScrollRoot] = useState(null)
  const goShelfRef = useRef(null)

  // 稳定引用，可直接作为 callback ref 使用
  const registerScrollRoot = useCallback(el => {
    setScrollRoot(el)
  }, [])

  const registerGoShelf = useCallback(fn => {
    goShelfRef.current = fn || null
  }, [])

  const goShelf = useCallback(() => {
    if (goShelfRef.current) goShelfRef.current()
  }, [])

  const value = useMemo(
    () => ({ scrollRoot, registerScrollRoot, registerGoShelf, goShelf }),
    [scrollRoot, registerScrollRoot, registerGoShelf, goShelf]
  )

  return (
    <AlbumUIContext.Provider value={value}>{children}</AlbumUIContext.Provider>
  )
}

export function useAlbumUI() {
  return useContext(AlbumUIContext)
}
