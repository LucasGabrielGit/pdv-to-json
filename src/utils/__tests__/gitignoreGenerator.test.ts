import { describe, it, expect } from 'vitest'
import {
  generateGitignore,
  generateRobotsTxt,
  generateDockerConfig,
} from '../gitignoreGenerator'

describe('gitignoreGenerator', () => {
  it('should generate merged .gitignore with deduplication', () => {
    const output = generateGitignore(['node', 'nextjs', 'macos', 'vscode'], 'my-custom-build-folder/')
    expect(output).toContain('### --- Node.js / npm / pnpm / yarn --- ###')
    expect(output).toContain('### --- Next.js --- ###')
    expect(output).toContain('### --- macOS (OS X) --- ###')
    expect(output).toContain('### --- Visual Studio Code --- ###')
    expect(output).toContain('node_modules/')
    expect(output).toContain('.next/')
    expect(output).toContain('.DS_Store')
    expect(output).toContain('my-custom-build-folder/')
  })

  it('should return empty prompt placeholder when no templates or rules selected', () => {
    const output = generateGitignore([])
    expect(output).toContain('# Select templates above')
  })

  it('should generate standard robots.txt with allow, disallow and sitemap', () => {
    const robots = generateRobotsTxt({
      allowAll: true,
      disallowPaths: ['/api/', '/admin/'],
      sitemapUrl: 'https://dev-kit.tech/sitemap.xml',
    })
    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Disallow: /api/')
    expect(robots).toContain('Disallow: /admin/')
    expect(robots).toContain('Sitemap: https://dev-kit.tech/sitemap.xml')
  })

  it('should generate Dockerfile and docker-compose for Next.js and FastAPI', () => {
    const nextDocker = generateDockerConfig('nextjs')
    expect(nextDocker.dockerfile).toContain('FROM node:20-alpine AS base')
    expect(nextDocker.dockerfile).toContain('standalone')
    expect(nextDocker.compose).toContain('nextjs-app')

    const pythonDocker = generateDockerConfig('python-fastapi')
    expect(pythonDocker.dockerfile).toContain('FROM python:3.12-slim AS base')
    expect(pythonDocker.dockerfile).toContain('uvicorn')
    expect(pythonDocker.compose).toContain('fastapi-service')
  })
})
