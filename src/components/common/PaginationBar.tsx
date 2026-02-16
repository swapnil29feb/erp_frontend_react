
import React from 'react';

interface PaginationBarProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ currentPage, totalItems, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalItems === 0) return null;

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div style={styles.container}>
            <div style={styles.info}>
                Showing <span style={styles.bold}>{startItem}</span> to <span style={styles.bold}>{endItem}</span> of <span style={styles.bold}>{totalItems}</span> entries
            </div>
            <div style={styles.controls}>
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    style={{ ...styles.button, ...(currentPage === 1 ? styles.disabled : {}) }}
                >
                    Previous
                </button>
                <span style={styles.pageNumber}>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    style={{ ...styles.button, ...(currentPage === totalPages ? styles.disabled : {}) }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#fff',
    },
    info: {
        fontSize: '13px',
        color: '#64748b',
    },
    bold: {
        fontWeight: 600,
        color: '#1e293b',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    button: {
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#475569',
        backgroundColor: '#fff',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: '#f1f5f9',
    },
    pageNumber: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#334155',
    }
};

export default PaginationBar;
