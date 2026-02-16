
import React, { useState, useEffect } from 'react';
import type { BoqVersion } from '../../types/config';
import { boqService } from '../../services/boqService';

interface BOQTabProps {
    projectId: number;
}

const BOQTab: React.FC<BOQTabProps> = ({ projectId }) => {
    const [versions, setVersions] = useState<BoqVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadVersions();
    }, [projectId]);

    const loadVersions = async () => {
        try {
            const data = await boqService.getBOQVersions(projectId);
            setVersions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await boqService.generateBOQ(projectId);
            loadVersions();
            alert("BOQ generated successfully!");
        } catch (err) {
            alert("Failed to generate BOQ");
        } finally {
            setGenerating(false);
        }
    };

    const handleApprove = async (boqId: number) => {
        try {
            await boqService.approveBOQ(boqId);
            loadVersions();
            alert("BOQ approved!");
        } catch (err) {
            alert("Failed to approve BOQ");
        }
    };

    const handleDownload = (boqId: number, type: 'pdf' | 'excel') => {
        const baseUrl = '/api';
        const url = type === 'pdf'
            ? `${baseUrl}/boq/export/pdf/${boqId}/`
            : `${baseUrl}/boq/export/excel/${boqId}/`;
        window.open(url, '_blank');
    };

    return (
        <div className="tab-container">
            <div className="flex justify-between items-center mb-8">
                <h3 className="tab-title text-xl font-bold">BOQ Management</h3>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                    {generating ? 'Generating...' : 'Generate New BOQ'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-bottom border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Version</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Created At</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading versions...</td></tr>
                        ) : versions.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No BOQ versions found. Generate one to start.</td></tr>
                        ) : (
                            versions.map(v => (
                                <tr key={v.id}>
                                    <td className="px-6 py-4 font-medium text-gray-900">V{v.version_number}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(v.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {v.status === 'DRAFT' && (
                                                <button onClick={() => handleApprove(v.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Approve</button>
                                            )}
                                            <button onClick={() => handleDownload(v.id, 'pdf')} className="text-gray-600 hover:text-gray-900 text-sm font-medium">PDF</button>
                                            <button onClick={() => handleDownload(v.id, 'excel')} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Excel</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BOQTab;
