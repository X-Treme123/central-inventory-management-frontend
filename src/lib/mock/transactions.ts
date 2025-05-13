// lib/mock/transactions.ts

// Mock Stock In Transactions
export const mockStockInTransactions = [
  {
    transaction_id: 1001,
    reference_number: "REF-20250110-0830-001",
    transaction_type: "stock_in",
    transaction_date: "2025-01-10T08:30:00Z",
    supplier_name: "Tech Solutions Inc.",
    user_name: "Admin User",
    notes: "Regular monthly stock replenishment",
    status: "completed",
    items: [
      {
        product_name: "Laptop Dell XPS 13",
        product_id: 1,
        quantity: 5,
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A1"
      },
      {
        product_name: "Office Chair",
        product_id: 2,
        quantity: 10,
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A2"
      }
    ]
  },
  {
    transaction_id: 1002,
    reference_number: "REF-20250112-1415-002",
    transaction_type: "stock_in",
    transaction_date: "2025-01-12T14:15:00Z",
    supplier_name: "Office Depot",
    user_name: "Admin User",
    notes: "Office equipment for new department",
    status: "completed",
    items: [
      {
        product_name: "Office Desk",
        product_id: 5,
        quantity: 5,
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A2"
      }
    ]
  },
  {
    transaction_id: 1003,
    reference_number: "REF-20250115-0945-003",
    transaction_type: "stock_in",
    transaction_date: "2025-01-15T09:45:00Z",
    supplier_name: "Safety Gear Ltd.",
    user_name: "Admin User",
    notes: "Safety equipment restock",
    status: "completed",
    items: [
      {
        product_name: "First Aid Kit",
        product_id: 3,
        quantity: 20,
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "HSE Storage",
        rack_name: "HSE Rack 1"
      },
      {
        product_name: "Safety Helmet",
        product_id: 4,
        quantity: 30,
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "East Warehouse",
        rack_name: "Rack B1"
      }
    ]
  },
  {
    transaction_id: 1004,
    reference_number: "REF-20250120-1130-004",
    transaction_type: "stock_in",
    transaction_date: "2025-01-20T11:30:00Z",
    supplier_name: "Tech Solutions Inc.",
    user_name: "Admin User",
    notes: "Laptops for IT department",
    status: "completed",
    items: [
      {
        product_name: "Laptop Dell XPS 13",
        product_id: 1,
        quantity: 5,
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A1"
      }
    ]
  },
  {
    transaction_id: 1005,
    reference_number: "REF-20250125-1400-005",
    transaction_type: "stock_in",
    transaction_date: "2025-01-25T14:00:00Z",
    supplier_name: "Safety Gear Ltd.",
    user_name: "Admin User",
    notes: "First aid kits for all departments",
    status: "completed",
    items: [
      {
        product_name: "First Aid Kit",
        product_id: 3,
        quantity: 2,
        unit_name: "Pack",
        unit_code: "PACK",
        warehouse_name: "HSE Storage",
        rack_name: "HSE Rack 1"
      }
    ]
  }
];

// Mock Stock Out Transactions
export const mockStockOutTransactions = [
  {
    transaction_id: 2001,
    reference_number: "SO-20250111-0915-001",
    transaction_type: "stock_out",
    transaction_reason: "direct_request",
    transaction_date: "2025-01-11T09:15:00Z",
    user_name: "Admin User",
    requester_name: "John Doe",
    notes: "Equipment for new hire",
    status: "completed",
    items: [
      {
        product_name: "Laptop Dell XPS 13",
        product_id: 1,
        barcode: "IPCS0001",
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A1"
      },
      {
        product_name: "Office Chair",
        product_id: 2,
        barcode: "IPCS0003",
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A2"
      }
    ]
  },
  {
    transaction_id: 2002,
    reference_number: "SO-20250114-1345-002",
    transaction_type: "stock_out",
    transaction_reason: "incident",
    transaction_date: "2025-01-14T13:45:00Z",
    user_name: "Admin User",
    requester_name: "Safety Team",
    notes: "Emergency replacement",
    status: "completed",
    items: [
      {
        product_name: "First Aid Kit",
        product_id: 3,
        barcode: "IPCS0004",
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "HSE Storage",
        rack_name: "HSE Rack 1"
      }
    ]
  },
  {
    transaction_id: 2003,
    reference_number: "SO-20250117-1030-003",
    transaction_type: "stock_out",
    transaction_reason: "regular",
    transaction_date: "2025-01-17T10:30:00Z",
    user_name: "Admin User",
    requester_name: "Construction Team",
    notes: "Weekly equipment issuance",
    status: "completed",
    items: [
      {
        product_name: "Safety Helmet",
        product_id: 4,
        barcode: "IPCS0005",
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "East Warehouse",
        rack_name: "Rack B1"
      }
    ]
  },
  {
    transaction_id: 2004,
    reference_number: "SO-20250122-0900-004",
    transaction_type: "stock_out",
    transaction_reason: "direct_request",
    transaction_date: "2025-01-22T09:00:00Z",
    user_name: "Admin User",
    requester_name: "Jane Smith",
    notes: "Replacement for damaged equipment",
    status: "completed",
    items: [
      {
        product_name: "Laptop Dell XPS 13",
        product_id: 1,
        barcode: "IPCS0002",
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A1"
      }
    ]
  },
  {
    transaction_id: 2005,
    reference_number: "SO-20250126-1500-005",
    transaction_type: "stock_out",
    transaction_reason: "regular",
    transaction_date: "2025-01-26T15:00:00Z",
    user_name: "Admin User",
    requester_name: "Department Manager",
    notes: "Office setup for new workspace",
    status: "completed",
    items: [
      {
        product_name: "Office Chair",
        product_id: 2,
        barcode: "IPCS0003",
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A2"
      },
      {
        product_name: "Office Desk",
        product_id: 5,
        barcode: "IPCS0005",
        unit_name: "Piece",
        unit_code: "PCS",
        warehouse_name: "Main Warehouse",
        rack_name: "Rack A2"
      }
    ]
  }
];