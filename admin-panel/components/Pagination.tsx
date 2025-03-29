import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from 'components/ui/pagination'

interface ShadcnPaginationProps {
  className?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
}

const ShadcnPagination: React.FC<ShadcnPaginationProps> = ({
  className,
  currentPage,
  totalPages,
  onPageChange,
  previousLabel = 'Previous',
  nextLabel = 'Next',
}) => {
  const generatePages = () => {
    const pages: (number | 'ellipsis')[] = []

    const siblingCount = 1

    const range = (
      start: number, end: number,
    ) =>
      Array.from(
        { length: end - start + 1 },
        (
          _, i,
        ) => i + start,
      )

    if (totalPages <= 5 + siblingCount * 2) {
      return range(
        1,
        totalPages,
      )
    }

    const firstPage = 1
    const lastPage = totalPages
    const leftSiblingIndex = Math.max(
      currentPage - siblingCount,
      firstPage,
    )
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      lastPage,
    )

    pages.push(firstPage)

    if (leftSiblingIndex > firstPage + 1) {
      pages.push('ellipsis')
    } else {
      for (let i = firstPage + 1; i < leftSiblingIndex; i++) {
        pages.push(i)
      }
    }

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== firstPage && i !== lastPage) {
        pages.push(i)
      }
    }

    if (rightSiblingIndex < lastPage - 1) {
      pages.push('ellipsis')
    } else {
      // Include pages between rightSiblingIndex and lastPage
      for (let i = rightSiblingIndex + 1; i < lastPage; i++) {
        pages.push(i)
      }
    }

    // Always show last page
    if (lastPage !== firstPage) {
      pages.push(lastPage)
    }

    return pages
  }

  const pages = generatePages()

  return (
    <Pagination
      role='pagination'
      className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            title={previousLabel}
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) {
                onPageChange(currentPage - 1)
              }
            }}
          />
        </PaginationItem>

        {pages.map((
          item, index,
        ) => {
          if (item === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }
          return (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={item === currentPage}
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(item as number)
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            title={nextLabel}
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1)
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default ShadcnPagination
