/**
 * @jest-environment node
 */
import {
  buildImageSources,
  buildSizedSource,
  computeTargetPixelWidth,
  DEFAULT_SIZES,
  IMAGE_TIERS,
  isNotionProxyUrl,
  pickWidthTier
} from '@/themes/circlelife/components/imageSrcset'

const PROXY =
  'https://www.notion.so/image/attachment%3Adead4ba0-6cf6-4b23-bdde-4c6b4753dd1d%3AIMG_0070.jpeg?table=block&id=3fe96e70-33d3-8048-87f5-cbf61e1a7cae&t=3fe96e70-33d3-8048-87f5-cbf61e1a7cae&width=1200&cache=v2'

describe('imageSrcset', () => {
  it('Notion 反代地址产出 512/1024 两档候选', () => {
    const { src, srcSet, sizes } = buildImageSources(PROXY)

    expect(src).toContain(`width=${IMAGE_TIERS.desktop}`)
    expect(srcSet).toContain(`${IMAGE_TIERS.mobile}w`)
    expect(srcSet).toContain(`${IMAGE_TIERS.desktop}w`)
    // 两档必须指向同一张源图，只差 width 参数
    const [mobileCandidate, desktopCandidate] = srcSet.split(', ')
    expect(new URL(mobileCandidate.split(' ')[0]).searchParams.get('id')).toBe(
      new URL(desktopCandidate.split(' ')[0]).searchParams.get('id')
    )
    expect(sizes).toBe(DEFAULT_SIZES)
  })

  it('src 与 1024 档候选严格一致，避免预加载与实际取图二次下载', () => {
    const { src, srcSet } = buildImageSources(PROXY)
    const desktopCandidate = srcSet.split(', ')[1].split(' ')[0]
    expect(src).toBe(desktopCandidate)
  })

  it('请求宽度不再落到 2048 档', () => {
    const { src, srcSet } = buildImageSources(PROXY)
    expect(src).not.toContain('width=1200')
    expect(srcSet).not.toContain('width=1200')
    expect(srcSet).not.toContain('width=2048')
  })

  it('非反代地址不生成候选，退化为纯 src', () => {
    for (const url of [
      '/images/starter/about/about-image-01.jpg',
      'https://example.com/photo.jpg',
      'https://prod-files-secure.s3.us-west-2.amazonaws.com/x.jpg?X-Amz-Signature=1'
    ]) {
      const out = buildImageSources(url)
      expect(out.src).toBe(url)
      expect(out.srcSet).toBe('')
      expect(out.sizes).toBe('')
    }
  })

  it('svg 与非法输入安全降级', () => {
    expect(buildImageSources('https://www.notion.so/image/logo.svg').srcSet).toBe(
      ''
    )
    expect(buildImageSources('')).toEqual({ src: '', srcSet: '', sizes: '' })
    expect(buildImageSources(undefined)).toEqual({
      src: '',
      srcSet: '',
      sizes: ''
    })
  })

  it('可覆盖 sizes', () => {
    const out = buildImageSources(PROXY, { sizes: '100vw' })
    expect(out.sizes).toBe('100vw')
  })

  it('isNotionProxyUrl 判定', () => {
    expect(isNotionProxyUrl(PROXY)).toBe(true)
    expect(isNotionProxyUrl('https://www.notion.so/3fe96e70')).toBe(false)
    expect(isNotionProxyUrl('/image/x.jpg')).toBe(false)
    expect(isNotionProxyUrl(null)).toBe(false)
  })

  /**
   * 直连取图（不走 srcset）：2026-10 实测 Notion 代理对**同一个 URL** 会按请求
   * 方式返回不同的图 —— 直连 src 给未裁切原图，走 srcset 选档给「预裁切小图」。
   * 首页一律直连 → 裁切只由 canvas 的 drawCover 做一次。
   */
  describe('直连取图（buildSizedSource / 档位量化）', () => {
    it('按目标像素选档位：300 → 512，880 → 1024，3000 → 2048', () => {
      expect(pickWidthTier(300)).toBe(512)
      expect(pickWidthTier(880)).toBe(1024)
      expect(pickWidthTier(3000)).toBe(2048)
      expect(pickWidthTier(256)).toBe(256)
      expect(pickWidthTier(0)).toBe(256)
    })

    it('目标像素宽度 = 显示宽 × DPR，量化到档位', () => {
      // 照片墙卡片：150 CSS × DPR2 = 300 → 512 档
      expect(computeTargetPixelWidth(150, 2)).toBe(512)
      // 影集封面 / 文章图版：440 × DPR2 = 880 → 1024 档
      expect(computeTargetPixelWidth(440, 2)).toBe(1024)
      // DPR1：150 × 1 = 150 → 落到最小档 256
      expect(computeTargetPixelWidth(150, 1)).toBe(256)
      // 超大屏也封顶在 2048
      expect(computeTargetPixelWidth(4000, 3)).toBe(2048)
    })

    it('只改写 width 参数，其余参数原样保留', () => {
      const url = buildSizedSource(PROXY, 300)
      const parsed = new URL(url)
      expect(parsed.searchParams.get('width')).toBe('512')
      expect(parsed.searchParams.get('id')).toBe(
        new URL(PROXY).searchParams.get('id')
      )
      expect(parsed.searchParams.get('t')).toBe(
        new URL(PROXY).searchParams.get('t')
      )
      expect(parsed.searchParams.get('table')).toBe('block')
    })

    it('非反代地址原样返回（不产候选也不改参数）', () => {
      const plain = 'https://example.com/photo.jpg'
      expect(buildSizedSource(plain, 880)).toBe(plain)
      expect(buildSizedSource('/images/a.jpg', 880)).toBe('/images/a.jpg')
      expect(buildSizedSource('', 880)).toBe('')
    })

    it('未给目标像素时保持原地址', () => {
      expect(buildSizedSource(PROXY)).toBe(PROXY)
      expect(buildSizedSource(PROXY, 0)).toBe(PROXY)
    })

    it('直连 URL 与 srcset 的最大候选同源（同一张图，只差 width）', () => {
      const { src } = buildImageSources(PROXY)
      const sized = buildSizedSource(src, 880)
      expect(new URL(sized).searchParams.get('id')).toBe(
        new URL(src).searchParams.get('id')
      )
      expect(new URL(sized).searchParams.get('width')).toBe('1024')
    })
  })
})
