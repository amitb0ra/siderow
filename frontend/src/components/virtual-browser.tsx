"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight, RotateCw, Home } from "lucide-react"

interface VirtualBrowserProps {
  url: string
  isPlaying: boolean
}

interface BrowserContent {
  title: string
  description: string
  content: React.ReactNode
}

export function VirtualBrowser({ url, isPlaying }: VirtualBrowserProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([url])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [displayUrl, setDisplayUrl] = useState(url)

  const getContentForUrl = (urlString: string): BrowserContent => {
    const urlLower = urlString.toLowerCase()

    return {
      title: "Web Page",
      description: "Loading content",
      content: (
        <div className="text-center text-gray-400 p-8">
          <div className="text-lg mb-2">Loading content...</div>
        </div>
      ),
    }
  }

  const currentContent = getContentForUrl(displayUrl)

  const handleNavigate = (newUrl: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setDisplayUrl(newUrl)
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newUrl)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      setIsLoading(false)
    }, 500)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      setIsLoading(true)
      setTimeout(() => {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setDisplayUrl(history[newIndex])
        setIsLoading(false)
      }, 300)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setIsLoading(true)
      setTimeout(() => {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setDisplayUrl(history[newIndex])
        setIsLoading(false)
      }, 300)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  const handleHome = () => {
    handleNavigate("https://www.google.com")
  }

  return (
    <div className="w-full h-full bg-background p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
        {/* Browser Chrome */}
        <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center gap-2">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex === history.length - 1}
            className="px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={handleRefresh} className="px-2 py-1 hover:bg-gray-200 rounded" title="Refresh">
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleHome} className="px-2 py-1 hover:bg-gray-200 rounded" title="Home">
            <Home className="w-4 h-4" />
          </button>
          <div className="flex-1 bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 truncate">
            <input type="text" className="w-full" />
          </div>
          <button className="px-2 py-1 hover:bg-gray-200 rounded">⋮</button>
        </div>

        {/* Browser Content */}
        <div className="flex-1 overflow-auto bg-white">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p className="text-gray-600 text-sm">Loading...</p>
              </div>
            </div>
          ) : (
            currentContent.content
          )}
        </div>
      </div>
    </div>
  )
}
