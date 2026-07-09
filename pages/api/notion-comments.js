import { Client } from '@notionhq/client'
import {
  formatNotionComment,
  getPlainText,
  validateCommentPayload
} from '@/lib/plugins/notionComments'

const databaseId = process.env.NOTION_COMMENT_DATABASE_ID
const token = process.env.NOTION_TOKEN

const getClient = () => {
  if (!databaseId || !token) {
    throw new Error('Missing NOTION_COMMENT_DATABASE_ID or NOTION_TOKEN')
  }
  return new Client({ auth: token })
}

const getClientIp = req => {
  const forwardedFor = req.headers['x-forwarded-for']
  return String(
    Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || ''
  )
    .split(',')[0]
    .trim()
}

const fetchComments = async postId => {
  const notion = getClient()
  const comments = []
  let startCursor

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
      filter: {
        property: 'PostId',
        title: { equals: postId }
      },
      sorts: [{ timestamp: 'created_time', direction: 'ascending' }]
    })
    comments.push(
      ...response.results
        .filter(page => 'properties' in page)
        .map(formatNotionComment)
    )
    startCursor = response.has_more ? response.next_cursor : undefined
  } while (startCursor)

  return comments
}

const getParentLevel = async (notion, parentId, postId) => {
  if (!parentId) return 0
  const parent = await notion.pages.retrieve({ page_id: parentId })
  if (
    !('properties' in parent) ||
    getPlainText(parent.properties.PostId) !== postId
  ) {
    throw new Error('Invalid parent comment')
  }
  return parent.properties.Level?.type === 'number'
    ? parent.properties.Level.number || 1
    : 1
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const postId = String(req.query.postId || '').trim()
    if (!postId) {
      return res.status(400).json({ error: 'Missing postId' })
    }
    try {
      return res.status(200).json(await fetchComments(postId))
    } catch (error) {
      console.error('Failed to fetch Notion comments:', error)
      return res.status(500).json({ error: 'Failed to fetch comments' })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const validation = validateCommentPayload(req.body)
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error })
  }

  try {
    const notion = getClient()
    const { postId, content, author, parentId } = validation.value
    const level = (await getParentLevel(notion, parentId, postId)) + 1
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        PostId: { title: [{ text: { content: postId } }] },
        ParentId: {
          rich_text: parentId ? [{ text: { content: parentId } }] : []
        },
        Content: { rich_text: [{ text: { content } }] },
        Author: { email: author },
        Level: { number: level },
        IpAddress: {
          rich_text: [{ text: { content: getClientIp(req) || 'unknown' } }]
        }
      }
    })

    return res.status(200).json(formatNotionComment(response))
  } catch (error) {
    console.error('Failed to create Notion comment:', error)
    return res.status(500).json({ error: 'Failed to create comment' })
  }
}
