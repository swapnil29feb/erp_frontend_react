export const hasPermission = (
    permissions: string[],
    perm: string
): boolean => {
    return permissions.includes(perm);
};
