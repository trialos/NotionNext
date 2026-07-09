const {
  buildCommentTree,
  countReplies,
  formatNotionComment,
  validateCommentPayload
} = require('@/lib/plugins/notionComments')

describe('notionComments helpers', () => {
  test('validates comment input', () => {
    expect(
      validateCommentPayload({
        postId: 'post-1',
        content: 'hello',
        author: 'reader@example.com'
      })
    ).toMatchObject({ ok: true })

    expect(
      validateCommentPayload({
        postId: 'post-1',
        content: '',
        author: 'reader@example.com'
      })
    ).toEqual({ ok: false, error: 'Invalid content' })

    expect(
      validateCommentPayload({
        postId: 'post-1',
        content: 'hello',
        author: 'bad-email'
      })
    ).toEqual({ ok: false, error: 'Invalid author email' })
  })

  test('formats Notion database pages', () => {
    expect(
      formatNotionComment({
        id: 'comment-id',
        created_time: '2026-07-09T00:00:00.000Z',
        properties: {
          PostId: { type: 'title', title: [{ plain_text: 'post-1' }] },
          ParentId: { type: 'rich_text', rich_text: [] },
          Content: {
            type: 'rich_text',
            rich_text: [{ plain_text: 'hello' }]
          },
          Author: { type: 'email', email: 'reader@example.com' },
          Level: { type: 'number', number: 1 }
        }
      })
    ).toEqual({
      id: 'comment-id',
      postId: 'post-1',
      parentId: null,
      content: 'hello',
      author: 'reader',
      level: 1,
      createdTime: '2026-07-09T00:00:00.000Z'
    })
  })

  test('builds nested comment trees', () => {
    const tree = buildCommentTree([
      { id: 'root', parentId: null },
      { id: 'child', parentId: 'root' },
      { id: 'grandchild', parentId: 'child' }
    ])

    expect(tree).toHaveLength(1)
    expect(tree[0].children[0].children[0].id).toBe('grandchild')
    expect(countReplies(tree[0])).toBe(2)
  })
})
