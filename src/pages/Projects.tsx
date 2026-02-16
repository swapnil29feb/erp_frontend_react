import { useEffect, useState, type FC, type FormEvent } from "react";
import api from "../api/apiClient";
import { useNavigate, useLocation } from "react-router-dom";
import { boqService } from "../services/boqService";
import RowActionMenu from "../components/RowActionMenu";

interface Project {
    id: number;
    name: string;
    client_name: string;
    status: string;
    project_code: string;
    segment_area: string;
    updated_at?: string;
    boqCount?: number;
}

const Projects: FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [segmentFilter, setSegmentFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [count, setCount] = useState(0);

    const initialFormState = {
        name: "",
        project_code: "",
        client_name: "",
        location_metadata: "",
        status: "INQUIRY",
        expected_completion_date: "",
        refered_by: "",
        segment_area: "MASTER PLANNING",
        expecetd_mhr: "",
        fee: "",
        description: "",
        notes: "",
        tags: "",
        inquiry_type: "AREA_WISE",
    };

    const [form, setForm] = useState(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        if (status) {
            setStatusFilter(status);
        }
        if (params.get('new') === 'true') {
            setEditingId(null);
            setForm(initialFormState);
            setShowModal(true);
        }
    }, [location.search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const loadProjects = async () => {
        try {
            const res = await api.get("/projects/projects/");
            const data = res.data;

            const projectList = Array.isArray(data)
                ? data
                : data.results || [];

            const projectsWithBoq = await Promise.all(
                projectList.map(async (p: any) => {
                    const boqCount = await boqService.fetchBoqCount(p.id);
                    return {
                        ...p,
                        boqCount: boqCount
                    };
                })
            );

            setProjects(projectsWithBoq);

            if (!Array.isArray(data) && data.count !== undefined) {
                setCount(data.count);
            } else {
                setCount(projectList.length);
            }
        } catch (err) {
            console.error("Project load failed", err);
            setProjects([]);
        }
    };

    useEffect(() => {
        loadProjects();
    }, [statusFilter, segmentFilter, debouncedSearch, page]);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();

        if (editingId) {
            await handleUpdate(editingId);
            return;
        }

        try {
            const payload = {
                name: form.name,
                client_name: form.client_name,
                inquiry_type: form.inquiry_type,
                fee: Number(form.fee),
                location_metadata: {
                    address: form.location_metadata || "",
                },
                status: form.status || "INQUIRY",
                expected_completion_date: form.expected_completion_date || null,
                refered_by: form.refered_by || "",
                segment_area: form.segment_area,
                expecetd_mhr: form.expecetd_mhr ? Number(form.expecetd_mhr) : null,
                description: form.description || "",
                notes: form.notes || "",
                tags: form.tags || "",
            };

            await api.post("/projects/projects/", payload);
            setShowModal(false);
            setForm(initialFormState);
            loadProjects();
        } catch (err) {
            console.error("Create project failed", err);
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            const payload = {
                name: form.name,
                client_name: form.client_name,
                inquiry_type: form.inquiry_type,
                fee: Number(form.fee),
                location_metadata: {
                    address: form.location_metadata || "",
                },
                status: form.status,
                expected_completion_date: form.expected_completion_date || null,
                refered_by: form.refered_by || "",
                segment_area: form.segment_area,
                expecetd_mhr: form.expecetd_mhr ? Number(form.expecetd_mhr) : null,
                description: form.description || "",
                notes: form.notes || "",
                tags: form.tags || "",
            };

            await api.patch(`/projects/projects/${id}/`, payload);
            loadProjects();
            setShowModal(false);
            setForm(initialFormState);
            setEditingId(null);
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await api.delete(`/projects/projects/${id}/`);
            loadProjects();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const openEditModal = (project: any) => {
        setEditingId(project.id);
        const locMeta = project.location_metadata;
        const address = typeof locMeta === 'object' && locMeta?.address
            ? locMeta.address
            : (typeof locMeta === 'string' ? locMeta : "");

        setForm({
            name: project.name || "",
            project_code: project.project_code || "",
            client_name: project.client_name || "",
            location_metadata: address,
            status: project.status || "INQUIRY",
            expected_completion_date: project.expected_completion_date || "",
            refered_by: project.refered_by || "",
            segment_area: project.segment_area || "MASTER PLANNING",
            expecetd_mhr: project.expecetd_mhr || "",
            fee: project.fee || "",
            description: project.description || "",
            notes: project.notes || "",
            tags: project.tags || "",
            inquiry_type: project.inquiry_type || "AREA_WISE",
        });
        setShowModal(true);
    };

    const getStatusBadgeClass = (status: string) => {
        const s = status.toUpperCase();
        switch (s) {
            case 'INQUIRY': return 'badge inquiry';
            case 'CONFIGURING': return 'badge active';
            case 'BOQ_DRAFT': return 'badge warning';
            case 'COMMERCIAL_READY': return 'badge info';
            case 'FINAL': return 'badge completed';
            case 'WON': return 'badge success';
            case 'LOST': return 'badge error';
            case 'ACTIVE': return 'badge active';
            case 'COMPLETED': return 'badge completed';
            case 'ON_HOLD': return 'badge onhold';
            default: return 'badge default';
        }
    };

    const renderProjectAction = (project: Project) => {
        const actionStyle = {
            padding: '4px 12px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 500,
            whiteSpace: 'nowrap' as const
        };

        const handleAction = (e: React.MouseEvent, path: string) => {
            e.stopPropagation();
            navigate(path);
        };

        switch (project.status) {
            case 'INQUIRY':
                return (
                    <button style={actionStyle} onClick={(e) => handleAction(e, `/projects/${project.id}`)}>
                        Configure
                    </button>
                );
            case 'CONFIGURING':
                return (
                    <button style={actionStyle} onClick={(e) => handleAction(e, `/projects/${project.id}`)}>
                        Continue Config
                    </button>
                );
            case 'BOQ_DRAFT':
            case 'COMMERCIAL_READY':
                return (
                    <button style={actionStyle} onClick={(e) => handleAction(e, `/boq/${project.id}`)}>
                        Open BOQ
                    </button>
                );
            case 'FINAL':
            case 'WON':
                return (
                    <button style={actionStyle} onClick={(e) => handleAction(e, `/boq/${project.id}`)}>
                        View BOQ
                    </button>
                );
            default:
                return (
                    <button style={actionStyle} onClick={(e) => handleAction(e, `/projects/${project.id}`)}>
                        View
                    </button>
                );
        }
    };

    const totalPages = Math.ceil(count / pageSize);

    return (
        <div style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Projects</h1>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-filters">
                        <input
                            type="text"
                            className="table-search"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="table-search"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="INQUIRY">Inquiry</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                        </select>
                        <select
                            className="table-search"
                            value={segmentFilter}
                            onChange={(e) => {
                                setSegmentFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Segments</option>
                            <option value="MASTER PLANNING">Master Planning</option>
                            <option value="COMMERCIAL">Commercial</option>
                            <option value="PRIVATE RESIDENCE">Private Residence</option>
                            <option value="RESIDENTIAL TOWNSHIP">Residential Township</option>
                            <option value="LANDSCAPE">Landscape</option>
                            <option value="FACADE">Facade</option>
                            <option value="HOSPITALITY">Hospitality</option>
                            <option value="HEALTH CARE">Health Care</option>
                            <option value="PUBLIC SPACE">Public Space</option>
                            <option value="INDUSTRIAL">Industrial</option>
                            <option value="RETAIL">Retail</option>
                            <option value="INFRASTRUCTURE">Infrastructure</option>
                            <option value="INSTITUTIONS">Institutions</option>
                            <option value="CLUB HOUSE">Club House</option>
                        </select>
                    </div>
                    <button
                        className="primary-btn"
                        onClick={() => {
                            setEditingId(null);
                            setForm(initialFormState);
                            setShowModal(true);
                        }}
                    >
                        + Add Project
                    </button>
                </div>

                <table className="erp-table compact">
                    <thead>
                        <tr>
                            <th style={{ width: '150px' }}>Code</th>
                            <th>Name</th>
                            <th>Client</th>
                            <th>Segment</th>
                            <th style={{ width: '120px' }}>Status</th>
                            <th>Last Updated</th>
                            <th className="action-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="table-empty">
                                    No projects found.
                                </td>
                            </tr>
                        ) : (
                            projects.map((p) => (
                                <tr
                                    key={p.id}
                                    className="erp-row-clickable"
                                    onClick={() => navigate(`/projects/${p.id}`)}
                                >
                                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.project_code || '-'}</td>
                                    <td style={{ fontWeight: '600', color: 'var(--primary-text)' }}>{p.name}</td>
                                    <td>{p.client_name}</td>
                                    <td>
                                        <span style={{ fontSize: '11px', padding: '2px 6px', background: '#f3f4f6', borderRadius: '4px' }}>
                                            {p.segment_area}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(p.status)}>{p.status.replace('_', ' ')}</span>
                                    </td>
                                    <td style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="action-cell">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {renderProjectAction(p)}
                                            <RowActionMenu
                                                onOpen={() => navigate(`/projects/${p.id}`)}
                                                onEdit={() => openEditModal(p)}
                                                onDelete={() => handleDelete(p.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="table-footer">
                    <div>
                        Showing {Math.min((page - 1) * pageSize + 1, count)} to {Math.min(page * pageSize, count)} of {count} projects
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            className="pagination-btn"
                            disabled={page === 1}
                            onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
                        >
                            Previous
                        </button>
                        <span style={{ padding: '0 8px' }}>Page {page} of {totalPages || 1}</span>
                        <button
                            className="pagination-btn"
                            disabled={page >= totalPages}
                            onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal remains with its own styles for now as requested to use the system everywhere but focusing on tables first */}
            {showModal && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.modal}>
                        <div style={modalStyles.header}>
                            <h2 style={modalStyles.title}>{editingId ? 'Edit Project' : 'Create New Project'}</h2>
                            <button onClick={() => setShowModal(false)} style={modalStyles.closeBtn}>✕</button>
                        </div>

                        <div style={modalStyles.modeSelector}>
                            <label style={modalStyles.modeLabel}>Inquiry Type</label>
                            <div style={modalStyles.radioGroup}>
                                <label style={modalStyles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="inquiry_type"
                                        value="AREA_WISE"
                                        checked={form.inquiry_type === "AREA_WISE"}
                                        onChange={(e) => setForm({ ...form, inquiry_type: e.target.value })}
                                    />
                                    Area → Subarea → Configuration
                                </label>
                                <label style={modalStyles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="inquiry_type"
                                        value="PROJECT_LEVEL"
                                        checked={form.inquiry_type === "PROJECT_LEVEL"}
                                        onChange={(e) => setForm({ ...form, inquiry_type: e.target.value })}
                                    />
                                    Direct Project BOQ
                                </label>
                            </div>
                        </div>

                        <form id="projectForm" onSubmit={handleCreate} style={modalStyles.formBody}>
                            <div>
                                <h3 style={modalStyles.sectionTitle}>Basic Information</h3>
                                <div style={modalStyles.grid}>
                                    <input
                                        placeholder="Project Name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="table-search"
                                        style={{ width: '100%', height: '40px' }}
                                        required
                                    />
                                    <input
                                        placeholder="Project Code"
                                        value={form.project_code}
                                        onChange={(e) => setForm({ ...form, project_code: e.target.value })}
                                        className="table-search"
                                        style={{ width: '100%', height: '40px' }}
                                    />
                                    <input
                                        placeholder="Client Name"
                                        value={form.client_name}
                                        onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                        className="table-search"
                                        style={{ width: '100%', height: '40px' }}
                                        required
                                    />
                                    <input
                                        placeholder="Location"
                                        value={form.location_metadata}
                                        onChange={(e) => setForm({ ...form, location_metadata: e.target.value })}
                                        className="table-search"
                                        style={{ width: '100%', height: '40px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 style={modalStyles.sectionTitle}>Commercial & Timeline</h3>
                                <div style={modalStyles.grid}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expected Completion</label>
                                        <input
                                            type="date"
                                            value={form.expected_completion_date}
                                            onChange={(e) => setForm({ ...form, expected_completion_date: e.target.value })}
                                            className="table-search"
                                            style={{ width: '100%', height: '40px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expected MHR</label>
                                        <input
                                            type="number"
                                            placeholder="Expected MHR"
                                            value={form.expecetd_mhr}
                                            onChange={(e) => setForm({ ...form, expecetd_mhr: e.target.value })}
                                            className="table-search"
                                            style={{ width: '100%', height: '40px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Project Fee</label>
                                        <input
                                            type="number"
                                            placeholder="Project Fee"
                                            value={form.fee}
                                            onChange={(e) => setForm({ ...form, fee: e.target.value })}
                                            className="table-search"
                                            style={{ width: '100%', height: '40px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={modalStyles.sectionTitle}>Segment & References</h3>
                                <div style={modalStyles.grid}>
                                    <select
                                        value={form.segment_area}
                                        onChange={(e) => setForm({ ...form, segment_area: e.target.value })}
                                        className="table-search"
                                        style={{ width: '100%', height: '40px' }}
                                    >
                                        <option value="MASTER PLANNING">Master Planning</option>
                                        <option value="HOSPITALITY">Hospitality</option>
                                        <option value="RESIDENTIAL">Residential</option>
                                        <option value="COMMERCIAL">Commercial</option>
                                    </select>
                                    <input
                                        placeholder="Referred By"
                                        value={form.refered_by}
                                        onChange={(e) => setForm({ ...form, refered_by: e.target.value })}
                                        className="table-search"
                                        style={{ width: '100%', height: '40px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 style={modalStyles.sectionTitle}>Notes & Tags</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <textarea
                                        placeholder="Notes"
                                        rows={3}
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        className="table-search"
                                        style={{ width: '100%', minHeight: '80px', padding: '10px' }}
                                    />
                                    <input
                                        placeholder="Tags (comma separated)"
                                        value={form.tags}
                                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                        className="table-search"
                                        style={{ width: '100%', height: '40px' }}
                                    />
                                </div>
                            </div>
                        </form>

                        <div style={modalStyles.footer}>
                            <button
                                type="button"
                                onClick={() => setForm(initialFormState)}
                                className="pagination-btn"
                                style={{ padding: '8px 16px' }}
                            >
                                Clear
                            </button>
                            <button
                                type="submit"
                                form="projectForm"
                                className="primary-btn"
                            >
                                Save Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalStyles = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
    },
    modal: {
        backgroundColor: 'white',
        width: '720px',
        maxHeight: '85vh',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column' as const
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
    },
    title: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#6b7280'
    },
    modeSelector: {
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
    },
    modeLabel: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        fontSize: '14px',
        color: '#374151'
    },
    radioGroup: { display: 'flex', gap: '24px' },
    radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
    formBody: {
        padding: '24px',
        overflowY: 'auto' as const,
        flex: 1
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#111827',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.025em'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '16px',
        marginBottom: '24px'
    },
    footer: {
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
    }
};

export default Projects;
