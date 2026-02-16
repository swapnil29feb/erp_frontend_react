import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    path?: string; // undefined means it's not clickable (current page)
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    const navigate = useNavigate();

    return (
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span style={{ color: '#9ca3af', margin: '0 4px' }}>/</span>
                    )}
                    {item.path ? (
                        <span
                            onClick={() => navigate(item.path!)}
                            style={{
                                cursor: 'pointer',
                                color: '#0ea5e9',
                                fontSize: '14px',
                                fontWeight: 500,
                                // hove: { textDecoration: 'underline' }
                            }}
                        >
                            {item.label}
                        </span>
                    ) : (
                        <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumb;
