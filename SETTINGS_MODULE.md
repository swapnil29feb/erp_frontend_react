# Settings Module - User and Access Management

## Overview
A comprehensive Settings module for managing users, roles, permissions, and audit logs in the ERP system.

## Architecture

### Main Components

1. **Settings Page** (`src/pages/Settings.tsx`)
   - Main entry point with tabbed navigation
   - Four tabs: Users, Roles, Permissions, Audit Logs
   - Clean card-based layout

2. **Users Tab** (`src/components/settings/UsersTab.tsx`)
   - User CRUD operations
   - Features:
     * List all users with email, role, status, last login
     * Add/Edit users with modal form
     * Disable/Enable user accounts
     * Reset passwords
     * Assign roles (groups) to users

3. **Roles Tab** (`src/components/settings/RolesTab.tsx`)
   - Role (Group) management
   - Features:
     * List all roles with description and user count
     * Create/Edit roles
     * Delete roles

4. **Permissions Tab** (`src/components/settings/PermissionsTab.tsx`)
   - Permission matrix for role-based access control
   - Features:
     * Select role from dropdown
     * Matrix layout with modules (rows) × permissions (columns)
     * Modules: Projects, Areas, Configuration, BOQ, Quotation, Masters, Reports
     * Permissions: View, Create, Edit, Delete, Approve, Export
     * Save all permissions in one operation

5. **Audit Logs Tab** (`src/components/settings/AuditLogsTab.tsx`)
   - Comprehensive audit log viewer
   - Features:
     * Filterable by user, entity type, and date range
     * Paginated view
     * Shows timestamp, user, action, entity, and details

### Services

1. **User Service** (`src/services/userService.ts`)
   ```typescript
   - getUsers()
   - createUser(payload)
   - updateUser(id, payload)
   - deleteUser(id)
   - resetPassword(id, newPassword)
   ```

2. **Role Service** (`src/services/roleService.ts`)
   ```typescript
   - getRoles()
   - createRole(payload)
   - updateRole(id, payload)
   - deleteRole(id)
   ```

3. **Permission Service** (`src/services/permissionService.ts`)
   ```typescript
   - getPermissionsByRole(roleId)
   - updatePermissions(payload)
   ```

## API Endpoints

### Users
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `PATCH /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user
- `POST /api/users/{id}/reset-password/` - Reset password

### Roles
- `GET /api/roles/` - List all roles
- `POST /api/roles/` - Create new role
- `PATCH /api/roles/{id}/` - Update role
- `DELETE /api/roles/{id}/` - Delete role

### Permissions
- `GET /api/permissions/?role_id={role_id}` - Get permissions for role
- `POST /api/permissions/update/` - Update permissions for role

### Audit Logs
- `GET /api/common/audit/logs/` - List audit logs
- Supports query params: `user_id`, `entity_type`, `start_date`, `end_date`, `page`, `page_size`

## Usage

### Accessing the Settings Module
1. Navigate to `/settings` in the application
2. Or click "Settings" in the sidebar navigation

### Managing Users
1. Go to Users tab (default)
2. Click "+ Add User" to create a new user
3. Fill in: First Name, Last Name, Email, Password, Role, Active status
4. For existing users:
   - Click "Edit" to modify user details
   - Click "Disable" to deactivate/reactivate
   - Click "Reset" to change password

### Managing Roles
1. Go to Roles tab
2. Click "+ New Role" to create a role
3. Provide role name and description
4. Edit or delete roles as needed

### Configuring Permissions
1. Go to Permissions tab
2. Select a role from the dropdown
3. Toggle permissions using the checkbox matrix
4. Click "Save Permissions" to apply changes

### Viewing Audit Logs
1. Go to Audit Logs tab
2. Use filters to narrow down logs:
   - Select specific user
   - Filter by entity type
   - Specify date range
3. Review logs with pagination

## Design Principles

### Layout
- Card-based design for clean organization
- Tabbed navigation for easy switching
- Consistent spacing and padding
- Responsive design that adapts to screen sizes

### Color Coding
- **Primary Actions**: Blue (`#2563eb`)
- **Destructive Actions**: Red (danger variant)
- **Status Indicators**:
  * Active: Green background (#dcfce7), green text (#16a34a)
  * Inactive: Red background (#fee2e2), red text (#dc2626)

### User Experience
- Modal dialogs for forms
- Confirmation dialogs for destructive actions
- Toast notifications for success/error feedback
- Loading states for async operations
- Search and filter capabilities
- Pagination for large data sets

## TypeScript Interfaces

### User
```typescript
interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    last_login?: string;
    groups?: number[];
    role_name?: string;
}
```

### Role
```typescript
interface Role {
    id: number;
    name: string;
    description?: string;
    user_count?: number;
}
```

### Permission
```typescript
interface Permission {
    id: number;
    module: string;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_approve: boolean;
    can_export: boolean;
}
```

## Security Considerations

1. **Password Reset**: Uses confirmation modal with direct input
2. **User Deletion**: Not exposed in UI (can be added if needed)
3. **Role Validation**: Prevents deletion of roles with assigned users (backend validation recommended)
4. **Permission Changes**: Saved in batch to maintain consistency
5. **Audit Trail**: All actions are logged for compliance

## Future Enhancements

1. **Advanced Filtering**: Add search/filter to Users and Roles tables
2. **Bulk Operations**: Select and modify multiple users at once
3. **Password Policy**: Enforce password complexity requirements
4. **Email Notifications**: Send emails on user creation/password reset
5. **Custom Permissions**: Allow creating custom permission types
6. **Role Hierarchy**: Implement role inheritance
7. **Activity Dashboard**: Visualize user activity patterns
8. **Export Functionality**: Download users/roles/logs as CSV/Excel

## Testing Checklist

- [ ] Create new user
- [ ] Edit existing user
- [ ] Disable/enable user
- [ ] Reset user password
- [ ] Assign multiple roles to user
- [ ] Create new role
- [ ] Edit role details
- [ ] Delete role
- [ ] View permissions for role
- [ ] Modify permissions
- [ ] Save permission changes
- [ ] Filter audit logs by user
- [ ] Filter audit logs by entity
- [ ] Filter audit logs by date range
- [ ] Pagination in all tables
- [ ] Responsive layout on mobile
