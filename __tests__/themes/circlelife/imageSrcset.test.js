/**
 * @jest-environment node
 */
import {
  buildImageSources,
  DEFAULT_SIZES,
  IMAGE_TIERS,
  isNotionProxyUrl
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
})
