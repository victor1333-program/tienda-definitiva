'use client'

import React from 'react'
import { focusUtils } from '@/lib/accessibility'

export default function SkipLink() {
  const handleSkipToMain = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    focusUtils.skipToMain()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSkipToMain(e)
    }
  }

  return (
    <a
      href="#main-content"
      onClick={handleSkipToMain}
      onKeyDown={handleKeyDown}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      tabIndex={0}
    >
      Saltar al contenido principal
    </a>
  )
}