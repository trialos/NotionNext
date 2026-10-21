/**
 * @jest-environment node
 */
import {
  ARCHIVE_ALL,
  ARCHIVE_UNCATEGORIZED,
  buildArchiveFacets,
  categoryKeyOf,
  filterArchivePosts,
  normalizePostTags,
  tagKeyOf
} from '@/themes/circlelife/components/archiveFilter'

const makePost = (id, category, tags = []) => ({
  id,
  category,
  tagItems: tags.map(name => ({ name, color: 'gray' }))
})

const ids = posts => posts.map(post => post.id)

const sampleArchive = {
  '2026-03': [
    makePost('alpha-1', 'Alpha', ['Shared', 'Solo']),
    makePost('beta-1', 'Beta', ['Shared'])
  ],
  '2026-02': [makePost('alpha-2', 'Alpha', ['Solo'])]
}

describe('archiveFilter', () => {
  test('handles empty or missing archive data', () => {
    ;[null, undefined, {}].forEach(input => {
      const facets = buildArchiveFacets(input)
      expect(facets.totalCount).toBe(0)
      expect(facets.categories).toEqual([
        { key: ARCHIVE_ALL, name: '', count: 0 }
      ])
      expect(facets.scopes.get(ARCHIVE_ALL)).toEqual({
        postCount: 0,
        tags: []
      })
      expect(filterArchivePosts(input)).toEqual({})
    })
  })

  test('counts categories and contextual tags per scope', () => {
    const facets = buildArchiveFacets(sampleArchive)

    expect(facets.totalCount).toBe(3)
    expect(facets.categories).toEqual([
      { key: ARCHIVE_ALL, name: '', count: 3 },
      { key: 'cat:Alpha', name: 'Alpha', count: 2 },
      { key: 'cat:Beta', name: 'Beta', count: 1 }
    ])

    expect(facets.scopes.get(ARCHIVE_ALL).postCount).toBe(3)
    expect(facets.scopes.get(ARCHIVE_ALL).tags).toEqual([
      { key: 'tag:Shared', name: 'Shared', count: 2 },
      { key: 'tag:Solo', name: 'Solo', count: 2 }
    ])

    expect(facets.scopes.get('cat:Alpha').postCount).toBe(2)
    expect(facets.scopes.get('cat:Alpha').tags).toEqual([
      { key: 'tag:Solo', name: 'Solo', count: 2 },
      { key: 'tag:Shared', name: 'Shared', count: 1 }
    ])

    expect(facets.scopes.get('cat:Beta').tags).toEqual([
      { key: 'tag:Shared', name: 'Shared', count: 1 }
    ])
  })

  test('puts missing and blank categories into uncategorized last on ties', () => {
    const archive = {
      '2026-03': [
        makePost('u1', '', ['TagU']),
        makePost('u2', '   ', []),
        makePost('u3', undefined, ['TagU']),
        makePost('real', 'Real', ['TagR'])
      ]
    }
    const facets = buildArchiveFacets(archive)

    expect(facets.categories).toEqual([
      { key: ARCHIVE_ALL, name: '', count: 4 },
      { key: ARCHIVE_UNCATEGORIZED, name: '', count: 3 },
      { key: 'cat:Real', name: 'Real', count: 1 }
    ])
    expect(facets.scopes.get(ARCHIVE_UNCATEGORIZED).postCount).toBe(3)
    expect(
      ids(filterArchivePosts(archive, ARCHIVE_UNCATEGORIZED)['2026-03'])
    ).toEqual(['u1', 'u2', 'u3'])

    const tied = buildArchiveFacets({
      '2026-03': [makePost('u4', '', []), makePost('r2', 'Real', [])]
    })
    expect(tied.categories).toEqual([
      { key: ARCHIVE_ALL, name: '', count: 2 },
      { key: 'cat:Real', name: 'Real', count: 1 },
      { key: ARCHIVE_UNCATEGORIZED, name: '', count: 1 }
    ])
  })

  test('real names looking like sentinels stay distinct', () => {
    const post = makePost('x', '__all__', ['__all__', '__uncategorized__'])
    const facets = buildArchiveFacets({ '2026-03': [post] })

    expect(categoryKeyOf(post)).toBe('cat:__all__')
    expect(facets.categories.map(category => category.key)).toEqual([
      ARCHIVE_ALL,
      'cat:__all__'
    ])
    expect(facets.scopes.get(ARCHIVE_ALL).tags.map(tag => tag.key)).toEqual([
      'tag:__all__',
      'tag:__uncategorized__'
    ])
    expect(filterArchivePosts({ '2026-03': [post] }, 'cat:__all__')).toEqual({
      '2026-03': [post]
    })
  })

  test('deduplicates tag names within a post and ignores invalid entries', () => {
    const post = {
      id: 'dup',
      category: 'Alpha',
      tagItems: [
        { name: 'Shared' },
        { name: 'Shared' },
        { name: '  ' },
        { name: null },
        {}
      ]
    }
    expect(normalizePostTags(post)).toEqual(['Shared'])
    const facets = buildArchiveFacets({ '2026-03': [post] })
    expect(facets.scopes.get(ARCHIVE_ALL).tags).toEqual([
      { key: 'tag:Shared', name: 'Shared', count: 1 }
    ])
  })

  test('ignores stale post.tags that are absent from tagItems', () => {
    const post = {
      id: 'stale',
      category: 'Alpha',
      tags: ['陈旧标签'],
      tagItems: [{ name: '新鲜标签' }]
    }
    const archive = { '2026-03': [post] }
    const facets = buildArchiveFacets(archive)

    expect(facets.scopes.get(ARCHIVE_ALL).tags).toEqual([
      { key: 'tag:新鲜标签', name: '新鲜标签', count: 1 }
    ])
    expect(
      filterArchivePosts(archive, ARCHIVE_ALL, tagKeyOf('陈旧标签'))
    ).toEqual({})
  })

  test('posts without tagItems still count toward their category', () => {
    const archive = { '2026-03': [makePost('plain', 'Alpha')] }
    const facets = buildArchiveFacets(archive)

    expect(facets.categories[1]).toEqual({
      key: 'cat:Alpha',
      name: 'Alpha',
      count: 1
    })
    expect(facets.scopes.get('cat:Alpha')).toEqual({
      postCount: 1,
      tags: []
    })
  })

  test('sorts tag facets by count then name deterministically', () => {
    const archive = {
      '2026-03': [
        makePost('a', 'Alpha', ['Beta']),
        makePost('b', 'Alpha', ['Alpha']),
        makePost('c', 'Alpha', ['Gamma', 'Gamma'])
      ]
    }
    const facets = buildArchiveFacets(archive)

    expect(facets.scopes.get(ARCHIVE_ALL).tags).toEqual([
      { key: 'tag:Alpha', name: 'Alpha', count: 1 },
      { key: 'tag:Beta', name: 'Beta', count: 1 },
      { key: 'tag:Gamma', name: 'Gamma', count: 1 }
    ])
  })

  test('ALL/ALL preserves month and post order without mutating input', () => {
    const filtered = filterArchivePosts(sampleArchive, ARCHIVE_ALL, ARCHIVE_ALL)

    expect(Object.keys(filtered)).toEqual(['2026-03', '2026-02'])
    expect(ids(filtered['2026-03'])).toEqual(['alpha-1', 'beta-1'])
    expect(ids(filtered['2026-02'])).toEqual(['alpha-2'])
    expect(filtered['2026-03']).not.toBe(sampleArchive['2026-03'])
    expect(filtered['2026-03'][0]).toBe(sampleArchive['2026-03'][0])
    expect(sampleArchive['2026-03']).toHaveLength(2)
  })

  test('filters by category, by tag, and by both', () => {
    expect(Object.keys(filterArchivePosts(sampleArchive, 'cat:Alpha'))).toEqual(
      ['2026-03', '2026-02']
    )
    expect(
      ids(
        filterArchivePosts(sampleArchive, 'cat:Alpha', tagKeyOf('Shared'))[
          '2026-03'
        ]
      )
    ).toEqual(['alpha-1'])
    expect(
      Object.keys(
        filterArchivePosts(sampleArchive, 'cat:Alpha', tagKeyOf('Shared'))
      )
    ).toEqual(['2026-03'])
    expect(
      Object.keys(
        filterArchivePosts(sampleArchive, ARCHIVE_ALL, tagKeyOf('Shared'))
      )
    ).toEqual(['2026-03'])
    expect(
      filterArchivePosts(sampleArchive, 'cat:Beta', tagKeyOf('Solo'))
    ).toEqual({})
    expect(filterArchivePosts(sampleArchive, 'cat:Missing')).toEqual({})
  })

  test('uncategorized scope exposes only its own tags', () => {
    const archive = {
      '2026-03': [
        makePost('u1', '', ['OnlyUncategorized']),
        makePost('a1', 'Alpha', ['OnlyAlpha'])
      ]
    }
    const facets = buildArchiveFacets(archive)

    expect(
      facets.scopes.get(ARCHIVE_UNCATEGORIZED).tags.map(tag => tag.name)
    ).toEqual(['OnlyUncategorized'])
    expect(
      filterArchivePosts(archive, ARCHIVE_UNCATEGORIZED, tagKeyOf('OnlyAlpha'))
    ).toEqual({})
  })
})
