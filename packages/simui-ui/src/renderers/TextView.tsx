import React from 'react'

type TextData = {
  text?: string
}

export default function TextView({ data, isFullscreen }: { data: TextData; isFullscreen?: boolean }) {
  const text = typeof data.text === 'string' ? data.text : ''

  const containerStyle: React.CSSProperties = isFullscreen
    ? {
        width: '100%',
        height: '100%',
        overflow: 'auto',
      }
    : {
        overflow: 'auto',
      }

  const textStyle: React.CSSProperties = isFullscreen
    ? {
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontSize: '16px',
        lineHeight: 1.6,
      }
    : {
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.5,
      }

  return (
    <div className="text-view" style={containerStyle}>
      {text ? (
        <p style={textStyle}>{text}</p>
      ) : (
        <div className="empty">No text content available</div>
      )}
    </div>
  )
}
