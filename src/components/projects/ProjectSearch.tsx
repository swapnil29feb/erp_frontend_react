
import { useEffect, useState } from "react";
import api from "../../api/apiClient";

export type Project = {
    id: number;
    name: string;
    code: string;
    client_name?: string;
};

interface Props {
    onSelect: (project: Project) => void;
}

export default function ProjectSearch({ onSelect }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Project[]>([]);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const search = async () => {
            try {
                const res = await api.get(`/projects/search/?q=${query}`);
                console.log("Search results:", res.data);
                // Adjust based on typical DRF response if needed, but going with res.data for now
                setResults(Array.isArray(res.data) ? res.data : res.data.results || []);
            } catch (err) {
                console.error("Project search failed", err);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            search();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div style={{ position: "relative", width: 320 }}>
            <input
                type="text"
                placeholder="Search project..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setShow(true);
                }}
                style={styles.input}
            />

            {show && results.length > 0 && (
                <div style={styles.dropdown}>
                    {results.map((p) => (
                        <div
                            key={p.id}
                            style={styles.item}
                            onClick={() => {
                                onSelect(p);
                                setQuery(`${p.name} (${p.code})`);
                                setShow(false);
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                        >
                            <div style={styles.itemName}>{p.name}</div>
                            <div style={styles.itemSubtitle}>
                                {p.code} • {p.client_name || 'No Client'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    input: {
        width: "100%",
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        outline: "none",
        transition: "border-color 0.2s",
    },
    dropdown: {
        position: "absolute" as const,
        top: "100%",
        left: 0,
        right: 0,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        zIndex: 100,
        marginTop: "4px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        maxHeight: "300px",
        overflowY: "auto" as const,
    },
    item: {
        padding: "10px 12px",
        cursor: "pointer",
        borderBottom: "1px solid #f3f4f6",
        transition: "background 0.2s",
    },
    itemName: {
        fontWeight: "bold" as const,
        fontSize: "13px",
        color: "#111827",
    },
    itemSubtitle: {
        fontSize: "11px",
        color: "#6b7280",
        marginTop: "2px",
    }
};
