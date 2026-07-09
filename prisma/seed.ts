import "dotenv/config";

import { execSync } from "node:child_process";

import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "Password123!";

type RowValue = string | number | null;

type SeedRow = Record<string, RowValue>;

function toSqlValue(value: RowValue) {
  if (value === null) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  return `'${value.replaceAll("'", "''")}'`;
}

function buildUpsertStatement(
  tableName: string,
  rows: SeedRow[],
  conflictColumn: string
) {
  if (rows.length === 0) {
    return "";
  }

  const columns = Object.keys(rows[0]);
  const values = rows
    .map(
      (row) =>
        `(${columns.map((column) => toSqlValue(row[column] ?? null)).join(", ")})`
    )
    .join(",\n");
  const updates = columns
    .filter((column) => column !== conflictColumn)
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(", ");

  return [
    `INSERT INTO ${tableName} (${columns.join(", ")})`,
    `VALUES\n${values}`,
    `ON CONFLICT (${conflictColumn}) DO UPDATE SET ${updates};`,
  ].join("\n");
}

function runSql(sql: string) {
  try {
    execSync("npx prisma db execute --stdin", {
      input: sql,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
      encoding: "utf8",
    });
  } catch (error) {
    if (error instanceof Error && "stderr" in error) {
      const execError = error as Error & {
        stdout?: unknown;
        stderr?: unknown;
      };
      const stderr = String(execError.stderr ?? "").trim();
      const stdout = String(execError.stdout ?? "").trim();
      const output = [stdout, stderr, execError.message]
        .filter(Boolean)
        .join("\n");

      throw new Error(output || "Seed execution failed.");
    }

    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not configured. Set DATABASE_URL before running the seed."
    );
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users: SeedRow[] = [
    {
      id: "seed_user_admin",
      name: "Alicia Hart",
      email: "admin@stockwise.demo",
      password: passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      phone: "+1-555-0100",
      avatar_url: null,
      created_at: "2026-01-05T08:00:00.000Z",
      updated_at: "2026-01-05T08:00:00.000Z",
    },
    {
      id: "seed_user_manager",
      name: "Marcus Reed",
      email: "manager@stockwise.demo",
      password: passwordHash,
      role: "MANAGER",
      status: "ACTIVE",
      phone: "+1-555-0101",
      avatar_url: null,
      created_at: "2026-01-05T08:05:00.000Z",
      updated_at: "2026-01-05T08:05:00.000Z",
    },
    {
      id: "seed_user_staff",
      name: "Nina Flores",
      email: "staff@stockwise.demo",
      password: passwordHash,
      role: "STAFF",
      status: "ACTIVE",
      phone: "+1-555-0102",
      avatar_url: null,
      created_at: "2026-01-05T08:10:00.000Z",
      updated_at: "2026-01-05T08:10:00.000Z",
    },
    {
      id: "seed_user_supplier_alpha",
      name: "David Chen",
      email: "supplier.alpha@stockwise.demo",
      password: passwordHash,
      role: "SUPPLIER",
      status: "ACTIVE",
      phone: "+1-555-0103",
      avatar_url: null,
      created_at: "2026-01-05T08:15:00.000Z",
      updated_at: "2026-01-05T08:15:00.000Z",
    },
    {
      id: "seed_user_supplier_beta",
      name: "Priya Nandakumar",
      email: "supplier.beta@stockwise.demo",
      password: passwordHash,
      role: "SUPPLIER",
      status: "ACTIVE",
      phone: "+1-555-0104",
      avatar_url: null,
      created_at: "2026-01-05T08:20:00.000Z",
      updated_at: "2026-01-05T08:20:00.000Z",
    },
  ];

  const suppliers: SeedRow[] = [
    {
      id: "seed_supplier_alpha",
      user_id: "seed_user_supplier_alpha",
      company_name: "North Harbor Industrial Supply",
      address: "1450 Commerce Ave, Seattle, WA",
      contact_person: "David Chen",
      phone: "+1-555-2100",
      supplier_category: "Packaging and storage",
      bank_account: "US12STOCK0001001",
      created_at: "2026-01-06T09:00:00.000Z",
      updated_at: "2026-01-06T09:00:00.000Z",
    },
    {
      id: "seed_supplier_beta",
      user_id: "seed_user_supplier_beta",
      company_name: "Vertex Warehouse Components",
      address: "88 Meridian Park, Austin, TX",
      contact_person: "Priya Nandakumar",
      phone: "+1-555-2200",
      supplier_category: "Hardware and electronics",
      bank_account: "US12STOCK0001002",
      created_at: "2026-01-06T09:05:00.000Z",
      updated_at: "2026-01-06T09:05:00.000Z",
    },
  ];

  const categories: SeedRow[] = [
    {
      id: "seed_category_accessories",
      name: "Workstation Accessories",
      slug: "workstation-accessories",
      description: "Ergonomic and desk support accessories for warehouse offices.",
      image_url: null,
      created_at: "2026-01-07T10:00:00.000Z",
      updated_at: "2026-01-07T10:00:00.000Z",
    },
    {
      id: "seed_category_scanning",
      name: "Scanning Equipment",
      slug: "scanning-equipment",
      description: "Barcode scanners and mobile capture tools.",
      image_url: null,
      created_at: "2026-01-07T10:05:00.000Z",
      updated_at: "2026-01-07T10:05:00.000Z",
    },
    {
      id: "seed_category_safety",
      name: "Safety Gear",
      slug: "safety-gear",
      description: "Protective equipment for warehouse operations.",
      image_url: null,
      created_at: "2026-01-07T10:10:00.000Z",
      updated_at: "2026-01-07T10:10:00.000Z",
    },
    {
      id: "seed_category_storage",
      name: "Storage Solutions",
      slug: "storage-solutions",
      description: "Bins, shelves, and storage helpers.",
      image_url: null,
      created_at: "2026-01-07T10:15:00.000Z",
      updated_at: "2026-01-07T10:15:00.000Z",
    },
    {
      id: "seed_category_devices",
      name: "Warehouse Devices",
      slug: "warehouse-devices",
      description: "Portable devices used in daily warehouse tasks.",
      image_url: null,
      created_at: "2026-01-07T10:20:00.000Z",
      updated_at: "2026-01-07T10:20:00.000Z",
    },
  ];

  const products: SeedRow[] = [
    {
      id: "seed_product_laptop_stand",
      category_id: "seed_category_accessories",
      name: "Adjustable Laptop Stand",
      sku: "SWS-ACC-001",
      description: "Foldable aluminum stand for packing stations.",
      purchase_price: "29.90",
      selling_price: "49.90",
      current_stock: 42,
      minimum_stock: 10,
      unit: "pcs",
      rack_location: "A1-01",
      image_url: null,
      qr_code: "QR-SWS-ACC-001",
      created_at: "2026-01-08T08:00:00.000Z",
      updated_at: "2026-01-08T08:00:00.000Z",
    },
    {
      id: "seed_product_monitor_arm",
      category_id: "seed_category_accessories",
      name: "Dual Monitor Arm",
      sku: "SWS-ACC-002",
      description: "Heavy-duty monitor arm for operations desks.",
      purchase_price: "54.50",
      selling_price: "89.00",
      current_stock: 18,
      minimum_stock: 6,
      unit: "pcs",
      rack_location: "A1-02",
      image_url: null,
      qr_code: "QR-SWS-ACC-002",
      created_at: "2026-01-08T08:05:00.000Z",
      updated_at: "2026-01-08T08:05:00.000Z",
    },
    {
      id: "seed_product_wireless_scanner",
      category_id: "seed_category_scanning",
      name: "Wireless Barcode Scanner",
      sku: "SWS-SCN-001",
      description: "Cordless scanner for receiving and dispatch lanes.",
      purchase_price: "72.00",
      selling_price: "119.00",
      current_stock: 26,
      minimum_stock: 8,
      unit: "pcs",
      rack_location: "B2-01",
      image_url: null,
      qr_code: "QR-SWS-SCN-001",
      created_at: "2026-01-08T08:10:00.000Z",
      updated_at: "2026-01-08T08:10:00.000Z",
    },
    {
      id: "seed_product_scanner_cradle",
      category_id: "seed_category_scanning",
      name: "Scanner Charging Cradle",
      sku: "SWS-SCN-002",
      description: "Docking cradle for wireless scanners.",
      purchase_price: "21.00",
      selling_price: "35.00",
      current_stock: 9,
      minimum_stock: 5,
      unit: "pcs",
      rack_location: "B2-02",
      image_url: null,
      qr_code: "QR-SWS-SCN-002",
      created_at: "2026-01-08T08:15:00.000Z",
      updated_at: "2026-01-08T08:15:00.000Z",
    },
    {
      id: "seed_product_safety_vest",
      category_id: "seed_category_safety",
      name: "Reflective Safety Vest",
      sku: "SWS-SAF-001",
      description: "High-visibility vest for floor staff.",
      purchase_price: "8.50",
      selling_price: "15.00",
      current_stock: 65,
      minimum_stock: 20,
      unit: "pcs",
      rack_location: "C1-01",
      image_url: null,
      qr_code: "QR-SWS-SAF-001",
      created_at: "2026-01-08T08:20:00.000Z",
      updated_at: "2026-01-08T08:20:00.000Z",
    },
    {
      id: "seed_product_work_gloves",
      category_id: "seed_category_safety",
      name: "Grip Work Gloves",
      sku: "SWS-SAF-002",
      description: "Reusable anti-slip gloves for handling cartons.",
      purchase_price: "4.20",
      selling_price: "8.50",
      current_stock: 120,
      minimum_stock: 30,
      unit: "pairs",
      rack_location: "C1-02",
      image_url: null,
      qr_code: "QR-SWS-SAF-002",
      created_at: "2026-01-08T08:25:00.000Z",
      updated_at: "2026-01-08T08:25:00.000Z",
    },
    {
      id: "seed_product_storage_bin",
      category_id: "seed_category_storage",
      name: "Stackable Storage Bin",
      sku: "SWS-STO-001",
      description: "Industrial bin for fast-moving inventory.",
      purchase_price: "12.40",
      selling_price: "22.00",
      current_stock: 84,
      minimum_stock: 25,
      unit: "pcs",
      rack_location: "D4-01",
      image_url: null,
      qr_code: "QR-SWS-STO-001",
      created_at: "2026-01-08T08:30:00.000Z",
      updated_at: "2026-01-08T08:30:00.000Z",
    },
    {
      id: "seed_product_label_roll",
      category_id: "seed_category_storage",
      name: "Thermal Label Roll",
      sku: "SWS-STO-002",
      description: "Printable labels for product identification and packing.",
      purchase_price: "5.75",
      selling_price: "10.50",
      current_stock: 14,
      minimum_stock: 15,
      unit: "rolls",
      rack_location: "D4-02",
      image_url: null,
      qr_code: "QR-SWS-STO-002",
      created_at: "2026-01-08T08:35:00.000Z",
      updated_at: "2026-01-08T08:35:00.000Z",
    },
    {
      id: "seed_product_handheld_terminal",
      category_id: "seed_category_devices",
      name: "Handheld Inventory Terminal",
      sku: "SWS-DEV-001",
      description: "Portable warehouse device for live inventory updates.",
      purchase_price: "415.00",
      selling_price: "599.00",
      current_stock: 7,
      minimum_stock: 4,
      unit: "pcs",
      rack_location: "E2-01",
      image_url: null,
      qr_code: "QR-SWS-DEV-001",
      created_at: "2026-01-08T08:40:00.000Z",
      updated_at: "2026-01-08T08:40:00.000Z",
    },
    {
      id: "seed_product_mobile_printer",
      category_id: "seed_category_devices",
      name: "Mobile Label Printer",
      sku: "SWS-DEV-002",
      description: "Portable printer for label and barcode operations.",
      purchase_price: "188.00",
      selling_price: "269.00",
      current_stock: 0,
      minimum_stock: 3,
      unit: "pcs",
      rack_location: "E2-02",
      image_url: null,
      qr_code: "QR-SWS-DEV-002",
      created_at: "2026-01-08T08:45:00.000Z",
      updated_at: "2026-01-08T08:45:00.000Z",
    },
  ];

  const restockOrders: SeedRow[] = [
    {
      id: "seed_restock_received",
      po_number: "PO-2026-0001",
      manager_id: "seed_user_manager",
      supplier_id: "seed_supplier_beta",
      status: "RECEIVED",
      order_date: "2026-02-15T09:00:00.000Z",
      expected_delivery_date: "2026-02-22T09:00:00.000Z",
      notes: "Priority replenishment for scanning devices.",
      confirmed_at: "2026-02-15T12:00:00.000Z",
      received_at: "2026-02-21T16:30:00.000Z",
      created_at: "2026-02-15T09:00:00.000Z",
      updated_at: "2026-02-21T16:30:00.000Z",
    },
    {
      id: "seed_restock_in_transit",
      po_number: "PO-2026-0002",
      manager_id: "seed_user_manager",
      supplier_id: "seed_supplier_alpha",
      status: "IN_TRANSIT",
      order_date: "2026-03-05T08:30:00.000Z",
      expected_delivery_date: "2026-03-12T09:00:00.000Z",
      notes: "Restocking storage bins and label rolls.",
      confirmed_at: "2026-03-05T13:10:00.000Z",
      received_at: null,
      created_at: "2026-03-05T08:30:00.000Z",
      updated_at: "2026-03-08T10:00:00.000Z",
    },
    {
      id: "seed_restock_pending",
      po_number: "PO-2026-0003",
      manager_id: "seed_user_manager",
      supplier_id: "seed_supplier_beta",
      status: "PENDING",
      order_date: "2026-03-18T11:00:00.000Z",
      expected_delivery_date: "2026-03-25T09:00:00.000Z",
      notes: "Pending approval on warehouse device replenishment.",
      confirmed_at: null,
      received_at: null,
      created_at: "2026-03-18T11:00:00.000Z",
      updated_at: "2026-03-18T11:00:00.000Z",
    },
  ];

  const restockOrderItems: SeedRow[] = [
    {
      id: "seed_roi_001",
      restock_order_id: "seed_restock_received",
      product_id: "seed_product_wireless_scanner",
      quantity: 12,
      estimated_price: "72.00",
      created_at: "2026-02-15T09:10:00.000Z",
      updated_at: "2026-02-15T09:10:00.000Z",
    },
    {
      id: "seed_roi_002",
      restock_order_id: "seed_restock_received",
      product_id: "seed_product_scanner_cradle",
      quantity: 8,
      estimated_price: "21.00",
      created_at: "2026-02-15T09:15:00.000Z",
      updated_at: "2026-02-15T09:15:00.000Z",
    },
    {
      id: "seed_roi_003",
      restock_order_id: "seed_restock_in_transit",
      product_id: "seed_product_storage_bin",
      quantity: 20,
      estimated_price: "12.40",
      created_at: "2026-03-05T08:45:00.000Z",
      updated_at: "2026-03-05T08:45:00.000Z",
    },
    {
      id: "seed_roi_004",
      restock_order_id: "seed_restock_in_transit",
      product_id: "seed_product_label_roll",
      quantity: 30,
      estimated_price: "5.75",
      created_at: "2026-03-05T08:47:00.000Z",
      updated_at: "2026-03-05T08:47:00.000Z",
    },
    {
      id: "seed_roi_005",
      restock_order_id: "seed_restock_pending",
      product_id: "seed_product_mobile_printer",
      quantity: 6,
      estimated_price: "188.00",
      created_at: "2026-03-18T11:10:00.000Z",
      updated_at: "2026-03-18T11:10:00.000Z",
    },
    {
      id: "seed_roi_006",
      restock_order_id: "seed_restock_pending",
      product_id: "seed_product_handheld_terminal",
      quantity: 4,
      estimated_price: "415.00",
      created_at: "2026-03-18T11:12:00.000Z",
      updated_at: "2026-03-18T11:12:00.000Z",
    },
  ];

  const transactions: SeedRow[] = [
    {
      id: "seed_tx_001",
      transaction_number: "TX-2026-0001",
      created_by: "seed_user_staff",
      approved_by: "seed_user_manager",
      source_restock_order_id: "seed_restock_received",
      type: "INCOMING",
      status: "COMPLETED",
      destination: "Central receiving dock",
      notes: "Auto-linked incoming transaction for received purchase order.",
      transaction_date: "2026-02-21T16:00:00.000Z",
      approved_at: "2026-02-21T16:25:00.000Z",
      created_at: "2026-02-21T16:00:00.000Z",
      updated_at: "2026-02-21T16:25:00.000Z",
    },
    {
      id: "seed_tx_002",
      transaction_number: "TX-2026-0002",
      created_by: "seed_user_staff",
      approved_by: "seed_user_manager",
      source_restock_order_id: null,
      type: "OUTGOING",
      status: "APPROVED",
      destination: "Retail branch west",
      notes: "Weekly branch replenishment shipment.",
      transaction_date: "2026-02-28T09:00:00.000Z",
      approved_at: "2026-02-28T09:30:00.000Z",
      created_at: "2026-02-28T09:00:00.000Z",
      updated_at: "2026-02-28T09:30:00.000Z",
    },
    {
      id: "seed_tx_003",
      transaction_number: "TX-2026-0003",
      created_by: "seed_user_staff",
      approved_by: null,
      source_restock_order_id: null,
      type: "INCOMING",
      status: "PENDING",
      destination: "Overflow inspection area",
      notes: "Pending QA confirmation before stock is accepted.",
      transaction_date: "2026-03-10T14:00:00.000Z",
      approved_at: null,
      created_at: "2026-03-10T14:00:00.000Z",
      updated_at: "2026-03-10T14:00:00.000Z",
    },
    {
      id: "seed_tx_004",
      transaction_number: "TX-2026-0004",
      created_by: "seed_user_staff",
      approved_by: "seed_user_manager",
      source_restock_order_id: null,
      type: "OUTGOING",
      status: "REJECTED",
      destination: "Field support team",
      notes: "Rejected because requested quantity exceeded current available stock.",
      transaction_date: "2026-03-14T11:30:00.000Z",
      approved_at: "2026-03-14T12:00:00.000Z",
      created_at: "2026-03-14T11:30:00.000Z",
      updated_at: "2026-03-14T12:00:00.000Z",
    },
  ];

  const transactionItems: SeedRow[] = [
    {
      id: "seed_ti_001",
      transaction_id: "seed_tx_001",
      product_id: "seed_product_wireless_scanner",
      quantity: 12,
      stock_before: 14,
      stock_after: 26,
      created_at: "2026-02-21T16:10:00.000Z",
      updated_at: "2026-02-21T16:10:00.000Z",
    },
    {
      id: "seed_ti_002",
      transaction_id: "seed_tx_001",
      product_id: "seed_product_scanner_cradle",
      quantity: 8,
      stock_before: 1,
      stock_after: 9,
      created_at: "2026-02-21T16:12:00.000Z",
      updated_at: "2026-02-21T16:12:00.000Z",
    },
    {
      id: "seed_ti_003",
      transaction_id: "seed_tx_002",
      product_id: "seed_product_laptop_stand",
      quantity: 8,
      stock_before: 50,
      stock_after: 42,
      created_at: "2026-02-28T09:10:00.000Z",
      updated_at: "2026-02-28T09:10:00.000Z",
    },
    {
      id: "seed_ti_004",
      transaction_id: "seed_tx_002",
      product_id: "seed_product_storage_bin",
      quantity: 6,
      stock_before: 90,
      stock_after: 84,
      created_at: "2026-02-28T09:12:00.000Z",
      updated_at: "2026-02-28T09:12:00.000Z",
    },
    {
      id: "seed_ti_005",
      transaction_id: "seed_tx_003",
      product_id: "seed_product_work_gloves",
      quantity: 20,
      stock_before: 120,
      stock_after: 120,
      created_at: "2026-03-10T14:10:00.000Z",
      updated_at: "2026-03-10T14:10:00.000Z",
    },
    {
      id: "seed_ti_006",
      transaction_id: "seed_tx_004",
      product_id: "seed_product_mobile_printer",
      quantity: 3,
      stock_before: 0,
      stock_after: 0,
      created_at: "2026-03-14T11:40:00.000Z",
      updated_at: "2026-03-14T11:40:00.000Z",
    },
  ];

  const supplierRatings: SeedRow[] = [
    {
      id: "seed_rating_001",
      restock_order_id: "seed_restock_received",
      manager_id: "seed_user_manager",
      supplier_id: "seed_supplier_beta",
      rating: 5,
      feedback: "Delivered complete scanner replenishment ahead of schedule.",
      created_at: "2026-02-22T09:00:00.000Z",
      updated_at: "2026-02-22T09:00:00.000Z",
    },
  ];

  const activityLogs: SeedRow[] = [
    {
      id: "seed_log_001",
      user_id: "seed_user_admin",
      action: "CREATE",
      module: "USERS",
      description: "Initialized demo warehouse team accounts.",
      ip_address: "127.0.0.1",
      created_at: "2026-01-05T08:30:00.000Z",
    },
    {
      id: "seed_log_002",
      user_id: "seed_user_manager",
      action: "CREATE",
      module: "RESTOCK_ORDERS",
      description: "Created purchase order PO-2026-0001 for scanner replenishment.",
      ip_address: "127.0.0.1",
      created_at: "2026-02-15T09:05:00.000Z",
    },
    {
      id: "seed_log_003",
      user_id: "seed_user_staff",
      action: "CREATE",
      module: "TRANSACTIONS",
      description: "Recorded incoming transaction TX-2026-0001 from receiving dock.",
      ip_address: "127.0.0.1",
      created_at: "2026-02-21T16:05:00.000Z",
    },
    {
      id: "seed_log_004",
      user_id: "seed_user_manager",
      action: "APPROVE",
      module: "TRANSACTIONS",
      description: "Approved outgoing transaction TX-2026-0002 for branch replenishment.",
      ip_address: "127.0.0.1",
      created_at: "2026-02-28T09:30:00.000Z",
    },
    {
      id: "seed_log_005",
      user_id: "seed_user_supplier_alpha",
      action: "UPDATE",
      module: "RESTOCK_ORDERS",
      description: "Marked PO-2026-0002 as in transit.",
      ip_address: "127.0.0.1",
      created_at: "2026-03-08T10:00:00.000Z",
    },
    {
      id: "seed_log_006",
      user_id: "seed_user_manager",
      action: "REJECT",
      module: "TRANSACTIONS",
      description: "Rejected TX-2026-0004 because requested printer stock was unavailable.",
      ip_address: "127.0.0.1",
      created_at: "2026-03-14T12:00:00.000Z",
    },
  ];

  const statements = [
    buildUpsertStatement("users", users, "id"),
    buildUpsertStatement("suppliers", suppliers, "id"),
    buildUpsertStatement("categories", categories, "id"),
    buildUpsertStatement("products", products, "id"),
    buildUpsertStatement("restock_orders", restockOrders, "id"),
    buildUpsertStatement("restock_order_items", restockOrderItems, "id"),
    buildUpsertStatement("transactions", transactions, "id"),
    buildUpsertStatement("transaction_items", transactionItems, "id"),
    buildUpsertStatement("supplier_ratings", supplierRatings, "id"),
    buildUpsertStatement("activity_logs", activityLogs, "id"),
  ].filter(Boolean);

  const sql = ["BEGIN;", ...statements, "COMMIT;"].join("\n\n");

  runSql(sql);

  console.log("StockWise demo seed completed.");
  console.log(`Demo login password: ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error("StockWise demo seed failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
