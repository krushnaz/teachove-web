# School Profile Component

A comprehensive and attractive UI component for displaying and managing school profile information.

## Features

- **Beautiful UI Design**: Modern, responsive design with gradient backgrounds and card-based layout
- **Profile Display**: Shows all school information in an organized, visually appealing way
- **Edit Profile**: Modal-based form for updating school information
- **Password Management**: Options to change password or reset password
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Proper loading and error handling
- **Form Validation**: Comprehensive validation for all form fields

## Components

### Main Components

1. **SchoolProfile.tsx** - Main profile display component
2. **EditProfileModal.tsx** - Modal for editing profile information
3. **ChangePasswordModal.tsx** - Modal for changing password
4. **ResetPasswordModal.tsx** - Modal for resetting password

### Service

- **schoolProfileService.ts** - API service for profile operations

## Usage

```tsx
import SchoolProfile from './components/SchoolAdmin/SchoolProfile';

// Use in your component
<SchoolProfile schoolId="your-school-id" />
```

## API Integration

The component integrates with the following API endpoints:

- `GET /api/schools/:schoolId/` - Fetch school profile
- `PUT /api/school/profile` - Update school profile
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Reset password

## Features

### Profile Display
- School name and type
- Contact information (email, phone)
- Address details
- Academic year
- System information (creation date, last updated)

### Edit Profile
- Update school name, type, and academic year
- Modify contact information
- Edit address details
- Form validation with error messages

### Password Management
- Change password with current password verification
- Password strength requirements
- Reset password via email
- Secure password input fields

## Styling

The component uses Tailwind CSS with:
- Gradient backgrounds
- Card-based layout
- Responsive grid system
- Modern shadows and rounded corners
- Color-coded sections for different information types

## Dependencies

- React 19+
- TypeScript
- Tailwind CSS
- Lucide React (for icons)
- Axios (for API calls)

## Route Integration

The component is integrated into the school admin routing at `/school-admin/profile`.

## Future Enhancements

- Profile picture upload
- Additional school information fields
- Audit trail for profile changes
- Bulk import/export functionality
- Advanced password policies 