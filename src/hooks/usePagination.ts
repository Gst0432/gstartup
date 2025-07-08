import { useState, useMemo } from 'react'

interface UsePaginationProps<T> {
  data: T[]
  itemsPerPage?: number
  initialPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  paginatedData: T[]
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  goToFirstPage: () => void
  goToLastPage: () => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  canGoToNext: boolean
  canGoToPrevious: boolean
}

export function usePagination<T>({
  data,
  itemsPerPage: initialItemsPerPage = 10,
  initialPage = 1
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  const canGoToNext = currentPage < totalPages
  const canGoToPrevious = currentPage > 1

  const handleSetCurrentPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const handleSetItemsPerPage = (items: number) => {
    setItemsPerPage(items)
    // Reset to first page when changing items per page
    setCurrentPage(1)
  }

  const goToFirstPage = () => handleSetCurrentPage(1)
  const goToLastPage = () => handleSetCurrentPage(totalPages)
  const goToNextPage = () => handleSetCurrentPage(currentPage + 1)
  const goToPreviousPage = () => handleSetCurrentPage(currentPage - 1)

  return {
    currentPage,
    totalPages: totalPages || 1,
    totalItems,
    itemsPerPage,
    paginatedData,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoToNext,
    canGoToPrevious
  }
}