import { applyMargin, approveBOQ, exportPDF, exportExcel } from "./boqService";

export default function BOQHeader({ boqId }: { boqId: number }) {
    return (
        <div className="boq-header" style={styles.header}>
            <div style={styles.btnGroup}>
                <button className="secondary-btn" onClick={() => applyMargin(boqId, 0)} style={styles.btn}>Apply Margin</button>
                <button className="primary-btn" onClick={() => approveBOQ(boqId)} style={styles.btn}>Approve</button>
            </div>
            <div style={styles.btnGroup}>
                <button className="secondary-btn" onClick={() => exportPDF(boqId)} style={{ ...styles.btn, backgroundColor: '#ef4444', color: 'white' }}>Export PDF</button>
                <button className="secondary-btn" onClick={() => exportExcel(boqId)} style={{ ...styles.btn, backgroundColor: '#10b981', color: 'white' }}>Export Excel</button>
            </div>
        </div>
    );
}

const styles = {
    header: {
        padding: "16px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    btnGroup: {
        display: "flex",
        gap: "8px"
    },
    btn: {
        padding: "6px 14px",
        fontSize: "13px",
        fontWeight: "500"
    }
};
