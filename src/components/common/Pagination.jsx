import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageInfo = true,
  showJumpToPage = true,
  itemsPerPageOptions = [10, 20, 50, 100],
  maxVisiblePages = 5,
  className = "",
}) => {
  const [jumpPage, setJumpPage] = useState("");

  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    // Always show first page
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const page = parseInt(jumpPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpPage("");
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Page info */}
      {showPageInfo && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Items per page selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation buttons */}
        <nav className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <FiChevronsRight className="w-4 h-4" />
          </button>
        </nav>

        {/* Jump to page */}
        {showJumpToPage && (
          <form onSubmit={handleJumpToPage} className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Go to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder="#"
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Pagination;
