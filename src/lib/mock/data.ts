// lib/mock/data.ts
// Mock data for the inventory management system

// Mock Products
export const mockProducts = [
  {
    product_id: 1,
    product_name: "Laptop Dell XPS 13",
    category_id: 1,
    category_name: "Electronics",
    category_type: "GA",
    description: "High-performance laptop for office use",
    status: "active",
    created_at: "2025-01-15T08:30:00Z",
    updated_at: "2025-01-15T08:30:00Z",
    units: [
      {
        product_unit_id: 1,
        product_id: 1,
        unit_id: 1,
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        product_unit_id: 2,
        product_id: 1,
        unit_id: 2,
        unit_name: "Box",
        unit_code: "BOX",
        is_base_unit: false,
        conversion_factor: 4.0
      }
    ]
  },
  {
    product_id: 2,
    product_name: "Office Chair",
    category_id: 2,
    category_name: "Furniture",
    category_type: "GA",
    description: "Ergonomic office chair with adjustable height",
    status: "active",
    created_at: "2025-01-16T10:15:00Z",
    updated_at: "2025-01-16T10:15:00Z",
    units: [
      {
        product_unit_id: 3,
        product_id: 2,
        unit_id: 1,
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      }
    ]
  },
  {
    product_id: 3,
    product_name: "First Aid Kit",
    category_id: 3,
    category_name: "Medical",
    category_type: "NON-GA",
    description: "Basic first aid kit for emergencies",
    status: "active",
    created_at: "2025-01-17T14:45:00Z",
    updated_at: "2025-01-17T14:45:00Z",
    units: [
      {
        product_unit_id: 4,
        product_id: 3,
        unit_id: 1,
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        product_unit_id: 5,
        product_id: 3,
        unit_id: 3,
        unit_name: "Pack",
        unit_code: "PACK",
        is_base_unit: false,
        conversion_factor: 10.0
      }
    ]
  },
  {
    product_id: 4,
    product_name: "Safety Helmet",
    category_id: 4,
    category_name: "Safety Equipment",
    category_type: "NON-GA",
    description: "Hard hat for construction site safety",
    status: "active",
    created_at: "2025-01-18T09:20:00Z",
    updated_at: "2025-01-18T09:20:00Z",
    units: [
      {
        product_unit_id: 6,
        product_id: 4,
        unit_id: 1,
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      }
    ]
  },
  {
    product_id: 5,
    product_name: "Office Desk",
    category_id: 2,
    category_name: "Furniture",
    category_type: "GA",
    description: "Standard office desk with drawers",
    status: "active",
    created_at: "2025-01-19T11:30:00Z",
    updated_at: "2025-01-19T11:30:00Z",
    units: [
      {
        product_unit_id: 7,
        product_id: 5,
        unit_id: 1,
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      }
    ]
  }
];

// Mock Units
export const mockUnits = [
  {
    unit_id: 1,
    unit_name: "Piece",
    unit_code: "PCS",
    unit_type: "PIECE",
    description: "Individual item",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    unit_id: 2,
    unit_name: "Box",
    unit_code: "BOX",
    unit_type: "PACK",
    description: "Box containing multiple pieces",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    unit_id: 3,
    unit_name: "Pack",
    unit_code: "PACK",
    unit_type: "PACK",
    description: "Package containing multiple pieces",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  }
];

// Mock Warehouses
export const mockWarehouses = [
  {
    warehouse_id: 1,
    warehouse_name: "Main Warehouse",
    location: "Jakarta Pusat",
    capacity: 1000,
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    warehouse_id: 2,
    warehouse_name: "East Warehouse",
    location: "Jakarta Timur",
    capacity: 750,
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    warehouse_id: 3,
    warehouse_name: "HSE Storage",
    location: "Jakarta Selatan",
    capacity: 500,
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  }
];

// Mock Racks
export const mockRacks = [
  {
    rack_id: 1,
    warehouse_id: 1,
    rack_name: "Rack A1",
    rack_code: "RA1",
    rack_barcode: "WH1-RA1",
    capacity: 100,
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    warehouse_name: "Main Warehouse"
  },
  {
    rack_id: 2,
    warehouse_id: 1,
    rack_name: "Rack A2",
    rack_code: "RA2",
    rack_barcode: "WH1-RA2",
    capacity: 100,
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    warehouse_name: "Main Warehouse"
  },
  {
    rack_id: 3,
    warehouse_id: 2,
    rack_name: "Rack B1",
    rack_code: "RB1",
    rack_barcode: "WH2-RB1",
    capacity: 75,
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    warehouse_name: "East Warehouse"
  },
  {
    rack_id: 4,
    warehouse_id: 2,
    rack_name: "Rack B2",
    rack_code: "RB2",
    rack_barcode: "WH2-RB2",
    capacity: 75,
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    warehouse_name: "East Warehouse"
  },
  {
    rack_id: 5,
    warehouse_id: 3,
    rack_name: "HSE Rack 1",
    rack_code: "HSE1",
    rack_barcode: "WH3-HSE1",
    capacity: 50,
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    warehouse_name: "HSE Storage"
  }
];

// Map of warehouse racks for easy lookup
export const mockWarehouseRacks = {
  1: [
    {
      rack_id: 1,
      warehouse_id: 1,
      rack_name: "Rack A1",
      rack_code: "RA1",
      rack_barcode: "WH1-RA1",
      capacity: 100,
      status: "active",
      warehouse_name: "Main Warehouse"
    },
    {
      rack_id: 2,
      warehouse_id: 1,
      rack_name: "Rack A2",
      rack_code: "RA2",
      rack_barcode: "WH1-RA2",
      capacity: 100,
      status: "active",
      warehouse_name: "Main Warehouse"
    }
  ],
  2: [
    {
      rack_id: 3,
      warehouse_id: 2,
      rack_name: "Rack B1",
      rack_code: "RB1",
      rack_barcode: "WH2-RB1",
      capacity: 75,
      status: "active",
      warehouse_name: "East Warehouse"
    },
    {
      rack_id: 4,
      warehouse_id: 2,
      rack_name: "Rack B2",
      rack_code: "RB2",
      rack_barcode: "WH2-RB2",
      capacity: 75,
      status: "active",
      warehouse_name: "East Warehouse"
    }
  ],
  3: [
    {
      rack_id: 5,
      warehouse_id: 3,
      rack_name: "HSE Rack 1",
      rack_code: "HSE1",
      rack_barcode: "WH3-HSE1",
      capacity: 50,
      status: "active",
      warehouse_name: "HSE Storage"
    }
  ]
};

// Mock Suppliers
export const mockSuppliers = [
  {
    supplier_id: 1,
    supplier_name: "Tech Solutions Inc.",
    contact_person: "John Smith",
    email: "john@techsolutions.com",
    phone: "+62 812-3456-7890",
    address: "Jl. Sudirman No. 123, Jakarta",
    tax_id: "TX12345",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    supplier_id: 2,
    supplier_name: "Office Depot",
    contact_person: "Jane Doe",
    email: "jane@officedepot.com",
    phone: "+62 811-2345-6789",
    address: "Jl. Gatot Subroto No. 456, Jakarta",
    tax_id: "TX54321",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    supplier_id: 3,
    supplier_name: "Safety Gear Ltd.",
    contact_person: "Robert Johnson",
    email: "robert@safetygear.com",
    phone: "+62 813-4567-8901",
    address: "Jl. Thamrin No. 789, Jakarta",
    tax_id: "TX67890",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  }
];

// Mock Inventory items
export const mockInventory = [
  {
    inventory_id: 1,
    product_id: 1,
    product_unit_id: 1,
    warehouse_id: 1,
    rack_id: 1,
    quantity: 10,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    product_name: "Laptop Dell XPS 13",
    category_name: "Electronics",
    category_type: "GA",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "Main Warehouse",
    rack_name: "Rack A1",
    rack_code: "RA1",
    barcode_count: 10
  },
  {
    inventory_id: 2,
    product_id: 2,
    product_unit_id: 3,
    warehouse_id: 1,
    rack_id: 2,
    quantity: 15,
    created_at: "2025-01-16T11:00:00Z",
    updated_at: "2025-01-16T11:00:00Z",
    product_name: "Office Chair",
    category_name: "Furniture",
    category_type: "GA",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "Main Warehouse",
    rack_name: "Rack A2",
    rack_code: "RA2",
    barcode_count: 15
  },
  {
    inventory_id: 3,
    product_id: 3,
    product_unit_id: 4,
    warehouse_id: 3,
    rack_id: 5,
    quantity: 20,
    created_at: "2025-01-17T15:00:00Z",
    updated_at: "2025-01-17T15:00:00Z",
    product_name: "First Aid Kit",
    category_name: "Medical",
    category_type: "NON-GA",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "HSE Storage",
    rack_name: "HSE Rack 1",
    rack_code: "HSE1",
    barcode_count: 20
  },
  {
    inventory_id: 4,
    product_id: 3,
    product_unit_id: 5,
    warehouse_id: 3,
    rack_id: 5,
    quantity: 2,
    created_at: "2025-01-17T15:30:00Z",
    updated_at: "2025-01-17T15:30:00Z",
    product_name: "First Aid Kit",
    category_name: "Medical",
    category_type: "NON-GA",
    unit_name: "Pack",
    unit_code: "PACK",
    warehouse_name: "HSE Storage",
    rack_name: "HSE Rack 1",
    rack_code: "HSE1",
    barcode_count: 2
  },
  {
    inventory_id: 5,
    product_id: 4,
    product_unit_id: 6,
    warehouse_id: 2,
    rack_id: 3,
    quantity: 30,
    created_at: "2025-01-18T10:00:00Z",
    updated_at: "2025-01-18T10:00:00Z",
    product_name: "Safety Helmet",
    category_name: "Safety Equipment",
    category_type: "NON-GA",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "East Warehouse",
    rack_name: "Rack B1",
    rack_code: "RB1",
    barcode_count: 30
  }
];

// Mock Barcodes
export const mockBarcodes = [
  {
    barcode_id: 1,
    product_id: 1,
    product_unit_id: 1,
    warehouse_id: 1,
    rack_id: 1,
    barcode: "IPCS0001",
    status: "available",
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    product_name: "Laptop Dell XPS 13",
    description: "High-performance laptop for office use",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "Main Warehouse",
    rack_name: "Rack A1"
  },
  {
    barcode_id: 2,
    product_id: 1,
    product_unit_id: 1,
    warehouse_id: 1,
    rack_id: 1,
    barcode: "IPCS0002",
    status: "available",
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    product_name: "Laptop Dell XPS 13",
    description: "High-performance laptop for office use",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "Main Warehouse",
    rack_name: "Rack A1"
  },
  {
    barcode_id: 3,
    product_id: 1,
    product_unit_id: 2,
    warehouse_id: 1,
    rack_id: 1,
    barcode: "PBOX0001",
    status: "available",
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    product_name: "Laptop Dell XPS 13",
    description: "High-performance laptop for office use",
    unit_name: "Box",
    unit_code: "BOX",
    warehouse_name: "Main Warehouse",
    rack_name: "Rack A1"
  },
  {
    barcode_id: 4,
    product_id: 2,
    product_unit_id: 3,
    warehouse_id: 1,
    rack_id: 2,
    barcode: "IPCS0003",
    status: "available",
    created_at: "2025-01-16T11:00:00Z",
    updated_at: "2025-01-16T11:00:00Z",
    product_name: "Office Chair",
    description: "Ergonomic office chair with adjustable height",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "Main Warehouse",
    rack_name: "Rack A2"
  },
  {
    barcode_id: 5,
    product_id: 3,
    product_unit_id: 4,
    warehouse_id: 3,
    rack_id: 5,
    barcode: "IPCS0004",
    status: "available",
    created_at: "2025-01-17T15:00:00Z",
    updated_at: "2025-01-17T15:00:00Z",
    product_name: "First Aid Kit",
    description: "Basic first aid kit for emergencies",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "HSE Storage",
    rack_name: "HSE Rack 1"
  },
  {
    barcode_id: 6,
    product_id: 3,
    product_unit_id: 5,
    warehouse_id: 3,
    rack_id: 5,
    barcode: "PPACK0001",
    status: "available",
    created_at: "2025-01-17T15:30:00Z",
    updated_at: "2025-01-17T15:30:00Z",
    product_name: "First Aid Kit",
    description: "Basic first aid kit for emergencies",
    unit_name: "Pack",
    unit_code: "PACK",
    warehouse_name: "HSE Storage",
    rack_name: "HSE Rack 1"
  },
  {
    barcode_id: 7,
    product_id: 4,
    product_unit_id: 6,
    warehouse_id: 2,
    rack_id: 3,
    barcode: "IPCS0005",
    status: "available",
    created_at: "2025-01-18T10:00:00Z",
    updated_at: "2025-01-18T10:00:00Z",
    product_name: "Safety Helmet",
    description: "Hard hat for construction site safety",
    unit_name: "Piece",
    unit_code: "PCS",
    warehouse_name: "East Warehouse",
    rack_name: "Rack B1"
  }
];

// Mock User
export const mockUser = {
  id: 24006300,
  name: "Admin User",
  email: "admin@example.com",
  divisi: "IT",
  avatar: null
};

// Mock transaction functions
let mockTransactionId = 1;

export const mockStockIn = (data) => {
  const transactionId = mockTransactionId++;
  return {
    code: "201",
    message: "Stock in processed successfully",
    data: {
      transaction_id: transactionId,
      transaction_type: "stock_in"
    }
  };
};

export const mockStockOutByBarcode = (barcode) => {
  const barcodeItem = mockBarcodes.find(item => item.barcode === barcode);
  
  if (!barcodeItem) {
    return {
      code: "404",
      message: "Barcode not found",
      data: null
    };
  }
  
  const transactionId = mockTransactionId++;
  return {
    code: "200",
    message: "Stock out processed successfully",
    data: {
      transaction_id: transactionId,
      product_name: barcodeItem.product_name,
      barcode: barcodeItem.barcode,
      unit_type: barcodeItem.unit_code === "PCS" ? "PIECE" : "PACK",
      unit_name: barcodeItem.unit_name,
      unit_code: barcodeItem.unit_code,
      transaction_type: "stock_out",
      transaction_reason: "direct_request"
    }
  };
};

export const mockBulkStockOut = (barcodes) => {
  const validBarcodes = barcodes.filter(barcode => 
    mockBarcodes.some(item => item.barcode === barcode)
  );
  
  if (validBarcodes.length === 0) {
    return {
      code: "404",
      message: "No valid barcodes found",
      data: null
    };
  }
  
  const transactionId = mockTransactionId++;
  return {
    code: "201",
    message: "Bulk stock out processed successfully",
    data: {
      transaction_id: transactionId,
      transaction_type: "stock_out",
      barcodes_processed: validBarcodes.length
    }
  };
};

// Function to get product details by barcode
export const getProductByBarcode = (barcode) => {
  const barcodeItem = mockBarcodes.find(item => item.barcode === barcode);
  
  if (!barcodeItem) {
    return {
      code: "404",
      message: "Barcode not found",
      data: null
    };
  }
  
  return {
    code: "200",
    message: "Product found",
    data: barcodeItem
  };
};