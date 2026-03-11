/**
 * OpenAI client singleton.
 *
 * Used exclusively by the ai-suggestions BullMQ worker to generate related
 * link suggestions for a collection. The model used is gpt-4o-mini for a
 * good balance of quality and cost.
 */
import OpenAI from 'openai'
import { env } from '../config/env.js'

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
