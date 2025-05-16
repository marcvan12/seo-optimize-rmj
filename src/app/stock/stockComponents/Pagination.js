'use client'
import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  DollarSign,
  ListFilter,
} from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@bprogress/next'
import { useCurrency } from '@/providers/CurrencyContext'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export default function SearchHeader({
  initialLimit = 50,
  currency,
  products,
  totalCount,
  children,
  sortField = 'dateAdded',
  sortDirection = 'asc',
  currentPage = 1,
  country = '',
  port = '',
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedCurrency, selectedCurrency } = useCurrency()

  const defaultSort = `${sortField}-${sortDirection}`
  const [sortValue, setSortValue] = useState(defaultSort)
  const [limitValue, setLimitValue] = useState(String(initialLimit))

  useEffect(() => {
    const hasSort = searchParams.has('sort')
    const hasPage = searchParams.has('page')

    // Reset to default if both are missing
    if (!hasSort && !hasPage) {
      setSortValue(defaultSort)
      setLimitValue(String(initialLimit))
    }
  }, [searchParams, defaultSort, initialLimit])

  const isLastPage = products.length < Number(initialLimit)
  const nextPage = currentPage + 1
  const prevPage = currentPage > 1 ? currentPage - 1 : 1

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`?${params.toString()}`, { showProgress: true })
  }

  const onSortChange = (value) => {
    setSortValue(value)
    updateParams({ sort: value, page: '1' })
  }

  const onPerPageChange = (newLimit) => {
    setLimitValue(newLimit)
    updateParams({ limit: newLimit, page: '1' })
  }

  const onCurrencyChange = (code) => {
    const options = [
      { code: 'USD', symbol: "USD$", value: 1 },
      { code: 'EUR', symbol: "EUR€", value: currency.usdToEur },
      { code: 'JPY', symbol: "JPY¥", value: currency.usdToJpy },
      { code: 'CAD', symbol: "CAD$", value: currency.usdToCad },
      { code: 'AUD', symbol: "AUD$", value: currency.usdToAud },
      { code: 'GBP', symbol: "GBP£", value: currency.usdToGbp },
    ]
    const sel = options.find((c) => c.code === code)
    if (sel) setSelectedCurrency(sel)
  }

  const updatePageURL = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    return params.toString()
  }

  const PaginationButtons = () => (
    <div className="flex gap-3 justify-end my-4">
      <Link
        href={currentPage > 1 ? `?${updatePageURL(prevPage)}` : '#'}
        aria-disabled={currentPage <= 1}
        className={cn(
          'h-10 w-10 flex items-center justify-center rounded-md transition-colors',
          currentPage > 1
            ? 'bg-[#0000ff] hover:bg-[#0000dd] text-white'
            : 'bg-gray-400 text-white cursor-not-allowed'
        )}
        onClick={(e) => currentPage <= 1 && e.preventDefault()}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <Link
        href={!isLastPage ? `?${updatePageURL(nextPage)}` : '#'}
        aria-disabled={isLastPage}
        className={cn(
          'h-10 w-10 flex items-center justify-center rounded-md transition-colors',
          !isLastPage
            ? 'bg-[#0000ff] hover:bg-[#0000dd] text-white'
            : 'bg-gray-400 text-white cursor-not-allowed'
        )}
        onClick={(e) => isLastPage && e.preventDefault()}
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  )

  return (
    <>
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{totalCount.toLocaleString()}</span>
              <span className="text-sm text-gray-600">units found</span>
            </div>
            <PaginationButtons />
          </div>

          <TooltipProvider>
            <div className="hidden sm:flex items-center justify-between w-full py-2 gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Sort by</span>
                <Select value={sortValue} onValueChange={onSortChange}>
                  <SelectTrigger className="w-[180px] h-9 px-3">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateAdded-asc">Update Old to New</SelectItem>
                    <SelectItem value="dateAdded-desc">Update New to Old</SelectItem>
                    <SelectItem value="fobPriceNumber-asc">Price Low to High</SelectItem>
                    <SelectItem value="fobPriceNumber-desc">Price High to Low</SelectItem>
                    <SelectItem value="regYearNumber-desc">Year New to Old</SelectItem>
                    <SelectItem value="regYearNumber-asc">Year Old to New</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">View Price in</span>
                <Select defaultValue={selectedCurrency.code} onValueChange={onCurrencyChange}>
                  <SelectTrigger className="w-[100px] h-9 px-3">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {['USD', 'EUR', 'JPY', 'CAD', 'AUD', 'GBP'].map((code) => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* 
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Per Page</span>
                <Select value={limitValue} onValueChange={onPerPageChange}>
                  <SelectTrigger className="w-[80px] h-9 px-3">
                    <SelectValue placeholder="Per page" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
            </div>

            <div className="sm:hidden w-full py-2">
              <div className="flex items-center mb-2 gap-1">
                <Tooltip><TooltipTrigger asChild><ArrowDownUp className="h-4 w-4 text-gray-600" /></TooltipTrigger><TooltipContent>Sort by</TooltipContent></Tooltip>
                <Select defaultValue={sortValue} onValueChange={onSortChange}>
                  <SelectTrigger className="w-full h-8 px-2 text-sm"><SelectValue placeholder="Sort" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateAdded-asc">Update Old to New</SelectItem>
                    <SelectItem value="dateAdded-desc">Update New to Old</SelectItem>
                    <SelectItem value="fobPriceNumber-asc">Price Low to High</SelectItem>
                    <SelectItem value="fobPriceNumber-desc">Price High to Low</SelectItem>
                    <SelectItem value="regYearNumber-desc">Year New to Old</SelectItem>
                    <SelectItem value="regYearNumber-asc">Year Old to New</SelectItem>

                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-start gap-2">
                <Tooltip><TooltipTrigger asChild><DollarSign className="h-4 w-4 text-gray-600" /></TooltipTrigger><TooltipContent>View Price in</TooltipContent></Tooltip>
                <Select defaultValue={selectedCurrency.code} onValueChange={onCurrencyChange}>
                  <SelectTrigger className="w-[70px] h-8 px-2 text-sm"><SelectValue placeholder="Currency" /></SelectTrigger>
                  <SelectContent>
                    {['USD', 'EUR', 'JPY', 'CAD', 'AUD', 'GBP'].map(code => (<SelectItem key={code} value={code}>{code}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Tooltip><TooltipTrigger asChild><ListFilter className="h-4 w-4 text-gray-600" /></TooltipTrigger><TooltipContent>Per Page</TooltipContent></Tooltip>
                {/* <Select defaultValue={String(initialLimit)} onValueChange={onPerPageChange}>
                  <SelectTrigger className="w-[60px] h-8 px-2 text-sm"><SelectValue placeholder="Per page" /></SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select> */}
              </div>
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3">
        {children}
        <PaginationButtons />
      </div>
    </>
  )
}
