import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function localApiMiddlewarePlugin() {
  const attachMiddleware = (server, mode = 'development') => {
    const rootEnv = loadEnv(mode, rootDir, '')
    const frontendEnv = loadEnv(mode, __dirname, '')
    Object.assign(process.env, rootEnv, frontendEnv)

    server.middlewares.use(async (req, res, next) => {
      if (!req.url || (!req.url.startsWith('/api/credential-crypto') && !req.url.startsWith('/api/pinata'))) {
        return next()
      }

      try {
        const parsedUrl = new URL(req.url, 'http://localhost')
        const query = Object.fromEntries(parsedUrl.searchParams.entries())

        const chunks = []
        for await (const chunk of req) {
          chunks.push(chunk)
        }
        const rawBody = Buffer.concat(chunks).toString('utf8')
        let parsedBody = {}
        if (rawBody) {
          try {
            parsedBody = JSON.parse(rawBody)
          } catch {
            parsedBody = rawBody
          }
        }

        const handlerFile = parsedUrl.pathname.endsWith('/pinata')
          ? path.resolve(rootDir, 'api', 'pinata.js')
          : path.resolve(rootDir, 'api', 'credential-crypto.js')

        const moduleUrl =
          mode === 'development'
            ? `${pathToFileURL(handlerFile).href}?t=${Date.now()}`
            : pathToFileURL(handlerFile).href
        const mod = await import(moduleUrl)

        const reqShim = {
          method: req.method,
          headers: req.headers,
          query,
          body: parsedBody,
        }

        const resShim = {
          statusCode: 200,
          setHeader: (k, v) => res.setHeader(k, v),
          status: (code) => {
            resShim.statusCode = code
            res.statusCode = code
            return resShim
          },
          json: (payload) => {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json')
            }
            res.end(JSON.stringify(payload))
            return resShim
          },
          send: (payload) => {
            res.end(typeof payload === 'string' ? payload : JSON.stringify(payload))
            return resShim
          },
        }

        await mod.default(reqShim, resShim)
      } catch (err) {
        console.error('Local API middleware error:', err)
        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Local API handler error', details: err.message }))
        }
      }
    })
  }

  return {
    name: 'tokcred-local-api-middleware',
    configureServer(server) {
      attachMiddleware(server, server.config.mode)
    },
    configurePreviewServer(server) {
      attachMiddleware(server, 'production')
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localApiMiddlewarePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow network access for mobile testing
    open: true
  }
})
