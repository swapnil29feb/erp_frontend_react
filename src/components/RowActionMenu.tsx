
import { useState, useRef, useEffect } from "react";

interface Props {
    onOpen: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function RowActionMenu({ onOpen, onEdit, onDelete }: Props) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="action-btn"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    setOpen(!open);
                }}
            >
                ⋮
            </button>

            {open && (
                <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setOpen(false); onOpen(); }}>Open</button>
                    <button onClick={() => { setOpen(false); onEdit(); }}>Edit</button>
                    <button className="danger" onClick={() => { setOpen(false); onDelete(); }}>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
