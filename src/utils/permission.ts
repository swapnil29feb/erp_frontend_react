export const hasPermission = (
  permissions: string[],
  module: string,
  action: string
) => {
  return permissions.includes(`${module}:${action}`);
};
