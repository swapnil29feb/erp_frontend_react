# ERP System - Project Management Dashboard

A modern TypeScript-based ERP system for managing lighting projects with a hierarchical structure: **Project → Area → Products → Drivers → Accessories → BOQ**.

## 🚀 Features

- **Project Management**: Create and manage multiple projects with client and location details
- **Area Configuration**: Define areas within projects (floors, rooms, zones)
- **Product Specification**: Add products with detailed specifications
- **Driver & Accessory Management**: Configure compatible drivers and accessories for each product
- **BOQ Generation**: Generate versioned Bill of Quantities with pricing
- **Modern ERP Dashboard**: Professional UI with sidebar navigation
- **Django API Ready**: Built-in API client for seamless Django backend integration

## 📋 Data Hierarchy

```
Project (Client, Location, Description)
  └── Area (Name, Floor, Dimensions)
      └── Product (Name, Category, Specification, Quantity)
          ├── Driver (Name, Model, Wattage, Voltage, Quantity)
          └── Accessory (Name, Type, Specification, Quantity)
              └── BOQ (Version, Revision, Items with Pricing)
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS with modern design system
- **State Management**: React Hooks
- **API Integration**: REST API client for Django backend

## 🎨 Design Features

- Modern ERP-style dashboard
- Gradient color scheme with professional aesthetics
- Smooth animations and transitions
- Responsive design
- Form validation
- Real-time data management

## 📦 Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd Project_Area_Prod_driver_acc_BOQ_22_12_2025
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   ```bash
   cp .env.example .env
   # Edit .env to set your Django API URL
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to `http://localhost:5173`

## 🌐 Django API Integration

### API Configuration

The application is ready to connect to a Django backend. Update the API URL in `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

### Expected Django API Endpoints

The application expects the following REST API endpoints:

#### Projects
- `GET /api/projects/` - List all projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}/` - Get project details
- `PATCH /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project

#### Areas
- `GET /api/projects/{projectId}/areas/` - List areas
- `POST /api/projects/{projectId}/areas/` - Create area
- `PATCH /api/projects/{projectId}/areas/{areaId}/` - Update area
- `DELETE /api/projects/{projectId}/areas/{areaId}/` - Delete area

#### Products
- `GET /api/projects/{projectId}/areas/{areaId}/products/` - List products
- `POST /api/projects/{projectId}/areas/{areaId}/products/` - Create product
- `PATCH /api/projects/{projectId}/areas/{areaId}/products/{productId}/` - Update product
- `DELETE /api/projects/{projectId}/areas/{areaId}/products/{productId}/` - Delete product

#### Drivers
- `POST /api/projects/{projectId}/areas/{areaId}/products/{productId}/drivers/` - Add driver
- `DELETE /api/projects/{projectId}/areas/{areaId}/products/{productId}/drivers/{driverId}/` - Delete driver

#### Accessories
- `POST /api/projects/{projectId}/areas/{areaId}/products/{productId}/accessories/` - Add accessory
- `DELETE /api/projects/{projectId}/areas/{areaId}/products/{productId}/accessories/{accessoryId}/` - Delete accessory

#### BOQ
- `GET /api/projects/{projectId}/boq/` - List BOQs
- `POST /api/projects/{projectId}/boq/` - Create BOQ
- `GET /api/projects/{projectId}/boq/{boqId}/` - Get BOQ details
- `PATCH /api/projects/{projectId}/boq/{boqId}/` - Update BOQ
- `GET /api/projects/{projectId}/boq/{boqId}/export/?format={format}` - Export BOQ (pdf/excel/csv)

### Using the API Client

Import and use the API client in your components:

```typescript
import { projectApi, areaApi, productApi, boqApi } from './api';

// Fetch all projects
const response = await projectApi.getAll();
if (response.success) {
  console.log(response.data);
}

// Create a new project
const newProject = await projectApi.create({
  name: 'New Project',
  client: 'Client Name',
  location: 'Location',
  description: 'Description'
});

// Create an area
const newArea = await areaApi.create(projectId, {
  name: 'Lobby',
  floor: 'Ground Floor',
  dimension: '10x12m',
  description: 'Main lobby area'
});

// Generate BOQ
const boq = await boqApi.create(projectId, {
  version: '1.0',
  revision: 1,
  status: 'draft',
  items: boqItems
});
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── Dashboard.tsx            # Home dashboard
│   ├── ProjectManagement.tsx    # Main project management container
│   ├── ProjectForm.tsx          # Project creation/selection
│   ├── AreaManagement.tsx       # Area management
│   ├── ProductManagement.tsx    # Product, driver, accessory management
│   └── BOQGeneration.tsx        # BOQ generation and export
├── types.ts                     # TypeScript type definitions
├── api.ts                       # Django API client
├── App.tsx                      # Main app component
├── App.css                      # App-specific styles
├── index.css                    # Global styles and design system
└── main.tsx                     # Entry point
```

## 🎯 Usage Guide

### 1. Create a Project
- Navigate to the **Project** page from the sidebar
- Click **"+ New Project"**
- Fill in project details (name, client, location, description)
- Click **"Create Project"**

### 2. Add Areas
- Select a project
- In the Area Management section, click **"+ Add Area"**
- Enter area details (name, floor, dimensions)
- Click **"Add Area"**

### 3. Add Products
- Select an area
- In the Product Management section, click **"+ Add Product"**
- Enter product details (name, category, quantity, specifications)
- Click **"Add Product"**

### 4. Add Drivers & Accessories
- Select a product
- Use **"+ Add Driver"** to add compatible drivers
- Use **"+ Add Accessory"** to add compatible accessories
- Fill in relevant specifications

### 5. Generate BOQ
- With a project selected that has areas and products
- In the BOQ Generation section, click **"Generate BOQ"**
- Set version and revision numbers
- Click **"Generate BOQ"**
- Enter unit prices in the table
- Click **"Export BOQ"** to save/send to Django API

## 🎨 Color Scheme

The application uses a professional color palette:

- **Primary**: Blue (`hsl(220, 90%, 56%)`)
- **Secondary**: Purple (`hsl(280, 70%, 60%)`)
- **Accent**: Teal (`hsl(160, 70%, 50%)`)
- **Warning**: Orange (`hsl(38, 92%, 50%)`)
- **Success**: Green (`hsl(142, 71%, 45%)`)
- **Danger**: Red (`hsl(0, 84%, 60%)`)

## 🔧 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 📝 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a custom ERP system. For modifications or enhancements, follow these guidelines:

1. Maintain the hierarchical data structure
2. Keep the design system consistent
3. Ensure all forms have proper validation
4. Update TypeScript types when adding new fields
5. Test Django API integration endpoints

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ using React, TypeScript, and Vite**
