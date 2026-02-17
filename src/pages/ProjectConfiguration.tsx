
import { useEffect, useState } from "react";
import { getProjectConfigurations } from "../services/configurationService";
import { useParams } from "react-router-dom";

const ProjectConfiguration = () => {
    const { projectId } = useParams();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConfigurations();
    }, [projectId]);

    const loadConfigurations = async () => {
        try {
            setLoading(true);
            const data = await getProjectConfigurations(Number(projectId));
            setConfigs(data);
        } catch (err) {
            console.error("Failed to load configurations", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading configurations...</div>;

    if (!configs.length) {
        return (
            <div className="empty-state">
                <h3>No configuration yet</h3>
                <p>Add products to start configuration and generate technical specifications.</p>
                <button className="btn-primary">+ Add Product</button>
            </div>
        );
    }

    return (
        <div>
            {configs.map((config: any) => (
                <div key={config.id} className="config-card">
                    <h4>{config.product.name}</h4>
                    <p>Quantity: {config.quantity}</p>

                    <h5>Drivers</h5>
                    <ul>
                        {config.drivers.map((d: any) => (
                            <li key={d.id}>
                                {d.name}: {d.value}
                            </li>
                        ))}
                    </ul>

                    <h5>Accessories</h5>
                    <ul>
                        {config.accessories.map((a: any) => (
                            <li key={a.id}>
                                {a.name} × {a.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default ProjectConfiguration;
