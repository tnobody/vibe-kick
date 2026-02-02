import { afterAll, beforeAll, expect, test } from 'bun:test'
import { chromium, type Browser, type Page } from 'playwright'
import { createServer, type ViteDevServer } from 'vite'

const HOST = '127.0.0.1'
const STARTUP_TIMEOUT_MS = 60_000

const getAvailablePort = () => {
  const listener = Bun.listen({
    hostname: HOST,
    port: 0,
    socket: {
      data() {},
      open() {},
      close() {},
    },
  })
  const port = listener.port
  listener.stop()
  return port
}

const waitForServer = async (url: string) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetch(url)
      console.log(response);
      
      if (response.ok) {
        return
      }
    } catch {
      // Retry until the dev server responds.
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Dev server did not respond within ${STARTUP_TIMEOUT_MS}ms.`)
}

let devServer: ViteDevServer | null = null
let browser: Browser | null = null
let page: Page | null = null
let pageErrors: Error[] = []
let baseUrl = ''

beforeAll(async () => {
  const port = getAvailablePort()
  baseUrl = `http://${HOST}:${port}`
  devServer = await createServer({
    server: {
      host: HOST,
      port,
    },
  })
  await devServer.listen()

  await waitForServer(baseUrl)

  browser = await chromium.launch()
  page = await browser.newPage()
  pageErrors = []
  page.on('pageerror', (error) => {
    pageErrors.push(error)
  })
})

afterAll(async () => {
  if (page) {
    await page.close()
  }
  if (browser) {
    await browser.close()
  }
  if (devServer) {
    await devServer.close()
  }
})

test('frontend loads without runtime errors', async () => {
  if (!page) {
    throw new Error('Playwright page not initialized.')
  }

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('canvas', { timeout: STARTUP_TIMEOUT_MS })
  expect(pageErrors).toHaveLength(0)
})
