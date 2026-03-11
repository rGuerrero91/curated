/**
 * Swagger / OpenAPI plugin.
 *
 * Registers @fastify/swagger (schema generation) and @fastify/swagger-ui
 * (browser UI). The docs UI is available at /docs in development only.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { env } from '../config/env.js'

async function swaggerPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Curated API',
        description: 'Backend API for the Curated social link-sharing platform',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
      components: {
        securitySchemes: {
          sessionCookie: {
            type: 'apiKey',
            in: 'cookie',
            name: 'curated_session',
          },
        },
      },
    },
  })

  if (env.NODE_ENV !== 'production') {
    await fastify.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', deepLinking: false },
    })
  }
}

export default fp(swaggerPlugin, { name: 'swagger' })
