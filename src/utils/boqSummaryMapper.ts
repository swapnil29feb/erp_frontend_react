
export const mapBOQSummary = (data: any) => {
    if (!data) return null;

    // The backend might return summary totals in a nested 'summary' object
    // with keys like LUMINAIRE / PRODUCT, DRIVER, ACCESSORY
    const nestedSummary = data.summary || {};

    // Support both PRODUCT and LUMINAIRE keys as they are used interchangeably in this project
    const luminaireData = nestedSummary.LUMINAIRE || nestedSummary.PRODUCT || { quantity: 0, amount: 0 };
    const driverData = nestedSummary.DRIVER || { quantity: 0, amount: 0 };
    const accessoryData = nestedSummary.ACCESSORY || { quantity: 0, amount: 0 };

    return {
        // Flat camelCase fields for easy UI binding as requested
        totalLuminaires: luminaireData.quantity || data.total_luminaires || 0,
        totalDrivers: driverData.quantity || data.total_drivers || 0,
        totalAccessories: accessoryData.quantity || data.total_accessories || 0,
        totalPower: data.total_power || data.total_wattage || 0,
        subtotal: data.subtotal || data.subtotal_cost || 0,

        // Keeping original structure for BOQ Page compatibility
        margin_percent: data.margin_percent || 0,
        margin_amount: data.margin_amount || 0,
        grand_total: data.grand_total || 0,
        status: data.status || 'DRAFT',
        version_number: data.version_number || data.version || 0,
        type_summary: nestedSummary
    };
};
