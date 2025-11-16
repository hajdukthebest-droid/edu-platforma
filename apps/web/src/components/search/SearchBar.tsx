'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Search, Loader2, TrendingUp, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface SearchSuggestion {
  type: string
  id: string
  title: string
  slug: string
  thumbnail: string | null
  url: string
}

interface SearchBarProps {
  variant?: 'default' | 'compact'
  placeholder?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
}

export default function SearchBar({
  variant = 'default',
  placeholder = 'Pretraži tečajeve, instruktore...',
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch suggestions
  const { data: suggestions, isLoading } = useQuery<SearchSuggestion[]>({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return []
      }
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`)
      return response.data.data
    },
    enabled: debouncedQuery.length >= 2,
  })

  // Fetch popular searches
  const { data: popularSearches } = useQuery<string[]>({
    queryKey: ['popular-searches'],
    queryFn: async () => {
      const response = await api.get('/search/popular?limit=5')
      return response.data.data
    },
  })

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    setShowSuggestions(false)
    setQuery('')

    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }, [router, onSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleSuggestionClick = (url: string) => {
    setShowSuggestions(false)
    setQuery('')
    router.push(url)
  }

  const handlePopularClick = (term: string) => {
    setQuery(term)
    handleSearch(term)
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setShowSuggestions(true)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const isCompact = variant === 'compact'

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isCompact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`${isCompact ? 'pl-10 pr-20 py-2 text-sm' : 'pl-12 pr-24 py-6 text-base'} w-full rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all`}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className={`absolute right-${isCompact ? '14' : '16'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            size={isCompact ? 'sm' : 'default'}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isCompact ? 'px-3 py-1.5' : 'px-6'} rounded-full`}
            disabled={!query.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className={isCompact ? 'text-sm' : ''}>Traži</span>
            )}
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2 || !query) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Suggestions from API */}
          {suggestions && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Prijedlozi
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion.url)}
                  className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  {suggestion.thumbnail ? (
                    <Image
                      src={suggestion.thumbnail}
                      alt={suggestion.title}
                      width={48}
                      height={32}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{suggestion.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isLoading && debouncedQuery.length >= 2 && (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Pretraživanje...</p>
            </div>
          )}

          {/* No results */}
          {!isLoading && debouncedQuery.length >= 2 && (!suggestions || suggestions.length === 0) && (
            <div className="py-8 text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nema rezultata za "{debouncedQuery}"</p>
              <Button
                onClick={() => handleSearch(debouncedQuery)}
                variant="link"
                className="mt-2"
              >
                Prikaži sve rezultate →
              </Button>
            </div>
          )}

          {/* Popular Searches */}
          {!query && popularSearches && popularSearches.length > 0 && (
            <div className="py-2 border-t">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Popularno
              </div>
              {popularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularClick(term)}
                  className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-2 transition-colors text-left"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Links */}
          {!query && (
            <div className="py-2 border-t bg-gray-50">
              <div className="px-4 py-2 grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/search?type=courses"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowSuggestions(false)}
                >
                  Svi tečajevi →
                </Link>
                <Link
                  href="/search?type=users"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowSuggestions(false)}
                >
                  Instruktori →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
