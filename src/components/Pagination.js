/**
 * Pagination - Reusable pagination component
 * 
 * Props:
 * - page: current page number
 * - totalPages: total number of pages
 * - onPageChange: callback function when page changes
 * -label: aria-label for the nav element (default: 'Pagination')
 * 
 */

const Pagination =({ page, totalPages, onPageChange, label = 'Pagination' })=> {

    if (totalPages <= 1) return null
    
    return (
        <nav aria-label={label} className='mt-4 mb-5'>
            <ul className='pagination justify-content-center'>
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button
                        className='page-link'
                        onClick={() => onPageChange(1)}
                        disabled={page === 1}
                        aria-label='First page'
                    >
                        &laquo;
                    </button>
                </li>
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button
                        className='page-link'
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        aria-label='Previous page'
                    >
                        Previous
                    </button>
                </li>
                <li className='page-item disabled'>
                    <span className='page-link'>
                        Page {page} of {totalPages}
                    </span>
                </li>
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <button
                        className='page-link'
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                        aria-label='Next page'
                    >
                        Next
                    </button>
                </li>
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <button
                        className='page-link'
                        onClick={() => onPageChange(totalPages)}
                        disabled={page === totalPages}
                        aria-label='Last page'
                    >
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    )
}

export default Pagination