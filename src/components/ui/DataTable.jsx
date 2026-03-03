/**
 * Wrapper around react-data-table-component – light theme. On mobile: card layout.
 */
import { useState, useMemo, useEffect } from 'react'
import DataTableLib from 'react-data-table-component'
import { HiSearch, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

const defaultPaginationOptions = [10, 25, 50, 100]

function getCellValue(col, row) {
  if (col.cell) return col.cell(row)
  const sel = col.selector
  if (typeof sel === 'function') return sel(row)
  return row[sel]
}

export default function DataTable({
  columns,
  data,
  title,
  searchPlaceholder = 'Search...',
  searchable = true,
  pagination = true,
  paginationPerPage = 10,
  paginationRowsPerPageOptions = defaultPaginationOptions,
  onSearch,
  filterComponent,
  selectableRows = false,
  onSelectedRowsChange,
  dense = false,
  noDataComponent,
  onRowClicked,
  ...rest
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [mobilePage, setMobilePage] = useState(1)

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data || []
    const term = searchTerm.toLowerCase()
    return (data || []).filter((row) =>
      columns.some((col) => {
        const key = col.selector || col.id
        if (typeof key === 'function') return false
        const val = row[key]
        return val != null && String(val).toLowerCase().includes(term)
      })
    )
  }, [data, searchTerm, columns])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / paginationPerPage))
  const mobileSlice = useMemo(() => {
    const start = (mobilePage - 1) * paginationPerPage
    return filteredData.slice(start, start + paginationPerPage)
  }, [filteredData, mobilePage, paginationPerPage])

  useEffect(() => {
    setMobilePage(1)
  }, [searchTerm, data?.length])

  // Mobile: card list (shown via md:hidden). Desktop: table (hidden md:block).

  const noData = noDataComponent || <div className="py-12 text-center text-gray-500">No data</div>

  return (
    <div className="space-y-4">
      {(title || searchable || filterComponent) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          <div className="flex flex-wrap items-center gap-2">
            {searchable && (
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none w-full sm:w-64"
                />
              </div>
            )}
            {filterComponent}
          </div>
        </div>
      )}

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
          {filteredData.length === 0 ? (
            noData
          ) : (
            <>
              <div className="space-y-3">
                {mobileSlice.map((row, idx) => (
                  <div
                    key={(row.id ?? row.userId ?? idx)}
                    role={onRowClicked ? 'button' : undefined}
                    onClick={onRowClicked ? () => onRowClicked(row) : undefined}
                    className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${onRowClicked ? 'cursor-pointer hover:bg-gray-50 active:scale-[0.99]' : ''}`}
                  >
                    <div className="space-y-2">
                      {columns.map((col, cidx) => (
                        <div key={col.name || col.id || cidx} className="flex flex-wrap items-start justify-between gap-2">
                          <span className="text-xs font-medium text-gray-500 shrink-0">{col.name}</span>
                          <span className="text-sm text-gray-800 text-right break-all">
                            {getCellValue(col, row)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {pagination && filteredData.length > paginationPerPage && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
                    disabled={mobilePage <= 1}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Previous page"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {mobilePage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobilePage((p) => Math.min(totalPages, p + 1))}
                    disabled={mobilePage >= totalPages}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Next page"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <DataTableLib
          columns={columns}
          data={filteredData}
          pagination={pagination}
          paginationPerPage={paginationPerPage}
          paginationRowsPerPageOptions={paginationRowsPerPageOptions}
          selectableRows={selectableRows}
          onSelectedRowsChange={onSelectedRowsChange}
          dense={dense}
          noDataComponent={noData}
          paginationComponentOptions={{ rowsPerPageText: 'Rows per page:', rangeSeparatorText: 'of' }}
          onRowClicked={onRowClicked}
          {...rest}
        />
      </div>
    </div>
  )
}
