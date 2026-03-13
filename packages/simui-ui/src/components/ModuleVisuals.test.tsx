import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ModuleVisuals from './ModuleVisuals'

describe('ModuleVisuals text renderer', () => {
  it('renders text visuals without showing the unknown renderer state', () => {
    const html = renderToStaticMarkup(
      <ModuleVisuals
        moduleName="squid"
        visuals={[
          {
            render: 'text',
            data: { text: 'Model Format: r', title: 'Summary' },
            description: 'r model',
          },
        ]}
      />,
    )

    expect(html).toContain('Summary')
    expect(html).toContain('Model Format: r')
    expect(html).toContain('text')
    expect(html).not.toContain('Unknown Renderer')
  })

  it('preserves multiline text with pre-wrap styling', () => {
    const html = renderToStaticMarkup(
      <ModuleVisuals
        moduleName="squid"
        visuals={[
          {
            render: 'text',
            data: { text: 'Line 1\nLine 2' },
          },
        ]}
      />,
    )

    expect(html).toContain('Line 1\nLine 2')
    expect(html).toContain('white-space:pre-wrap')
  })

  it('shows an inline empty state when text content is missing', () => {
    const html = renderToStaticMarkup(
      <ModuleVisuals
        moduleName="squid"
        visuals={[
          {
            render: 'text',
            data: {},
          },
        ]}
      />,
    )

    expect(html).toContain('No text content available')
    expect(html).not.toContain('Unknown Renderer')
  })
})
