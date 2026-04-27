import { NextResponse } from 'next/server'
import { generateSummary } from '@/lib/gemini'

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'Blog API up' }))
    }

    // POST /api/generate-summary  { body }
    if (route === '/generate-summary' && method === 'POST') {
      const { body } = await request.json()
      if (!body || typeof body !== 'string' || body.trim().length < 30) {
        return handleCORS(NextResponse.json(
          { error: 'Body must be at least 30 characters.' },
          { status: 400 }
        ))
      }
      const summary = await generateSummary(body)
      return handleCORS(NextResponse.json({ summary }))
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    ))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
