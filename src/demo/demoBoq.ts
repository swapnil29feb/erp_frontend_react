import type { BOQVersion } from "../modules/boq/types";

export function generateDemoConfiguration(_subareaId: number) {
    return [
        {
            id: 101,
            product: 1, // Matches generateDemoProducts
            driver: 10, // Matches generateDemoDrivers
            accessories: [20], // Matches generateDemoAccessories
            quantity: 25,
            created_at: new Date().toISOString()
        },
        {
            id: 102,
            product: 2,
            driver: 11,
            accessories: [],
            quantity: 12,
            created_at: new Date().toISOString()
        },
        {
            id: 103,
            product: 3,
            driver: 12,
            accessories: [21],
            quantity: 40,
            created_at: new Date().toISOString()
        }
    ];
}

export function generateDemoSummary(_projectId: number) {
    return {
        project_id: _projectId,
        total_luminaires: 77,
        total_drivers: 77,
        total_accessories: 65,
        total_cost: 215350, // (25*(1200+450+50)) + (12*(2400+800)) + (40*(1800+550+300))
        subtotal: 215350,
        margin_percent: 15,
        grand_total: 247652.5
    };
}

const demoState = {
    approvedIds: new Set([9001]),
    margins: new Map<number, number>([[9001, 15], [9002, 10]])
};

export function generateDemoBoqVersions(_projectId: number): BOQVersion[] {
    return [
        {
            id: 9001,
            version: 1,
            status: "APPROVED",
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 9002,
            version: 2,
            status: demoState.approvedIds.has(9002) ? "APPROVED" : "DRAFT",
            created_at: new Date(Date.now() - 3600000).toISOString()
        }
    ];
}

export function generateDemoBoqDetail(versionId: number) {
    const isApproved = demoState.approvedIds.has(versionId);
    return {
        id: versionId,
        project: 1,
        version: versionId === 9001 ? 1 : 2,
        status: isApproved ? "APPROVED" : "DRAFT",
        margin_percent: demoState.margins.get(versionId) || 0,
        items: [
            {
                id: 1001,
                area: "Lobby",
                product: "Crompton LUS-12-CDL",
                driver: "Philips DR-12-V1",
                accessories: "Mounting Clip",
                qty: 25,
                unit_price: 1700,
                total: 42500
            },
            {
                id: 1002,
                area: "Corridor",
                product: "Wipro WPR-18-WW",
                driver: "Wipro WDR-20-IP65",
                accessories: "-",
                qty: 12,
                unit_price: 3200,
                total: 38400
            },
            {
                id: 1003,
                area: "Meeting Room",
                product: "Havells HVL-PANEL-R",
                driver: "Havells HDR-15-STD",
                accessories: "Surface Border",
                qty: 40,
                unit_price: 2650,
                total: 106000
            }
        ]
    };
}

export function applyDemoMargin(versionId: number, margin: number) {
    demoState.margins.set(versionId, margin);
}

export function approveDemoBoq(versionId: number) {
    demoState.approvedIds.add(versionId);
}

export function generateDemoProducts() {
    return [
        { id: 1, make: "Crompton", order_code: "LUS-12-CDL", wattage: 12, lumen_output: 1200, base_price: 1200 },
        { id: 2, make: "Wipro", order_code: "WPR-18-WW", wattage: 18, lumen_output: 1800, base_price: 2400 },
        { id: 3, make: "Havells", order_code: "HVL-PANEL-R", wattage: 15, lumen_output: 1500, base_price: 1800 }
    ];
}

export function generateDemoDrivers() {
    return [
        { id: 10, make: "Philips", order_code: "DR-12-V1", max_wattage: 15, price: 450, driver_code: "DR-12-V1", dimming_protocol: "TRIAC" },
        { id: 11, make: "Wipro", order_code: "WDR-20-IP65", max_wattage: 20, price: 800, driver_code: "WDR-20-IP65", dimming_protocol: "0-10V" },
        { id: 12, make: "Havells", order_code: "HDR-15-STD", max_wattage: 15, price: 550, driver_code: "HDR-15-STD", dimming_protocol: "DALI" }
    ];
}

export function generateDemoAccessories() {
    return [
        { id: 20, make: "Generic", order_code: "ACC-01", accessory_name: "Mounting Clip", accessory_type: "CLIP", price: 50, accessory_category: "MOUNTING" },
        { id: 21, make: "Generic", order_code: "ACC-02", accessory_name: "Surface Border", accessory_type: "FRAME", price: 300, accessory_category: "MOUNTING" }
    ];
}
