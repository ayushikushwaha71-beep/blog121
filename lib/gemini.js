import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateSummary(body) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const prompt = `You are a professional editor. Read the following blog post and produce a concise, engaging summary in approximately 200 words. Capture the key ideas, tone, and takeaways. Do not add headings — just a flowing paragraph.\n\nBLOG POST:\n"""\n${body}\n"""\n\nSUMMARY (≈200 words):`
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()
  return text
}
