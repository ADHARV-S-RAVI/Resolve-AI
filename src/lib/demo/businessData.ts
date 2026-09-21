/**
 * ResolveAI demo business data (frontend mirror).
 *
 * This mirrors the exact 50-order master dataset used by the `chat-agent`
 * edge function (plus the preserved ORD-4821 duplicate-payment case), so the
 * customer UI can list orders and derive refund amounts without the customer
 * needing to know an order ID. All data is fictional.
 */

export type CustomerOrder = {
  id: string;
  product: string;
  status: string;
  amount: number;
  paymentStatus: string;
  returnStatus?: string;
  refundStatus?: string;
  refundAmount?: number;
  refundId?: string;
  cancellationEligible?: boolean;
  exchangeEligible?: boolean;
};

const C = (
  id: string,
  product: string,
  amount: number,
  status: string,
  opts: Partial<CustomerOrder> = {},
): CustomerOrder => ({
  id,
  product,
  amount,
  status,
  paymentStatus: "Paid",
  ...opts,
});

export const DEMO_CUSTOMER_ID = "C-10482";
export const DEMO_CUSTOMER_NAME = "Adharv Sharma";

export const CUSTOMER_ORDERS: CustomerOrder[] = [
  C("ORD-1001", "Mechanical Keyboard", 4999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1002", "Wireless Mouse", 1499, "Shipped"),
  C("ORD-1003", "Bluetooth Headphones", 2999, "Out for Delivery"),
  C("ORD-1004", "Gaming Monitor", 18999, "Delivered", { returnStatus: "Requested", refundStatus: "Pending", refundAmount: 18999, refundId: "RF-10004", exchangeEligible: true }),
  C("ORD-1005", "USB-C Hub", 2199, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1006", "Laptop Stand", 1899, "Delivered", { returnStatus: "Eligible - Damaged", exchangeEligible: true }),
  C("ORD-1007", "Backpack", 2499, "Shipped"),
  C("ORD-1008", "Smartwatch", 5499, "Delivered", { returnStatus: "Completed", refundStatus: "Completed", refundAmount: 5499, refundId: "RF-10008", exchangeEligible: true }),
  C("ORD-1009", "Wireless Earbuds", 3499, "Delivered", { returnStatus: "Requested", refundStatus: "Pending", refundAmount: 3499, refundId: "RF-10009", exchangeEligible: true }),
  C("ORD-1010", "External SSD", 7999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1011", "Webcam", 3299, "Delivered", { returnStatus: "Eligible - Wrong Item", exchangeEligible: true }),
  C("ORD-1012", "Mechanical Gaming Keyboard", 6499, "Shipped"),
  C("ORD-1013", "Power Bank", 1799, "Processing", { cancellationEligible: true }),
  C("ORD-1014", "Gaming Mouse", 2799, "Processing", { cancellationEligible: true }),
  C("ORD-1015", "Laptop Cooling Pad", 2299, "Just Placed", { cancellationEligible: true }),
  C("ORD-1016", "27-inch 4K Monitor", 29999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1017", "USB-C Cable", 699, "Out for Delivery"),
  C("ORD-1018", "Portable Bluetooth Speaker", 3999, "Delivered", { returnStatus: "Completed", refundStatus: "Completed", refundAmount: 3999, refundId: "RF-10018", exchangeEligible: true }),
  C("ORD-1019", "Wireless Keyboard", 2499, "Processing", { cancellationEligible: true }),
  C("ORD-1020", "Gaming Headset", 4499, "Delayed"),
  C("ORD-1021", "Office Chair", 8999, "Just Placed", { cancellationEligible: true }),
  C("ORD-1022", "Smartphone", 24999, "Delivered", { returnStatus: "Eligible - Damaged", exchangeEligible: true }),
  C("ORD-1023", "Tablet", 19999, "Delivered", { returnStatus: "Eligible - Wrong Item", exchangeEligible: true }),
  C("ORD-1024", "Smart TV", 34999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1025", "Laptop", 64999, "Delivered", { returnStatus: "Eligible - Damaged", exchangeEligible: true }),
  C("ORD-1026", "Printer", 12999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1027", "Wi-Fi Router", 3499, "Delivered", { returnStatus: "Expired" }),
  C("ORD-1028", "Smart Bulb", 899, "Delivered", { returnStatus: "Requested", refundStatus: "Pending", refundAmount: 899, refundId: "RF-10028", exchangeEligible: true }),
  C("ORD-1029", "Power Strip", 1299, "Delivered", { exchangeEligible: true }),
  C("ORD-1030", "External Hard Drive", 5999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1031", "Drawing Tablet", 8499, "Delayed"),
  C("ORD-1032", "Fitness Band", 2999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1033", "Soundbar", 11999, "Delivered", { returnStatus: "Eligible - Damaged", exchangeEligible: true }),
  C("ORD-1034", "USB Microphone", 6999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1035", "Camera Tripod", 2499, "Undelivered"),
  C("ORD-1036", "Digital Camera", 39999, "Delivered", { returnStatus: "Eligible - Wrong Item", exchangeEligible: true }),
  C("ORD-1037", "Portable Projector", 15999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1038", "Electric Kettle", 1599, "Just Placed", { cancellationEligible: true }),
  C("ORD-1039", "Coffee Maker", 4999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1040", "Air Purifier", 13999, "Delivered", { returnStatus: "Eligible - Damaged", exchangeEligible: true }),
  C("ORD-1041", "Desk Lamp", 1299, "Processing", { cancellationEligible: true }),
  C("ORD-1042", "Monitor Stand", 2799, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  C("ORD-1043", "USB Flash Drive", 999, "Shipped"),
  C("ORD-1044", "Gaming Controller", 4299, "Delivered", { returnStatus: "Eligible - Defective", exchangeEligible: true }),
  C("ORD-1045", "VR Headset", 32999, "Delivered", { returnStatus: "Expired" }),
  C("ORD-1046", "Smartphone Charger", 1499, "Shipped"),
  C("ORD-1047", "Smart Doorbell", 7499, "Delivered", { returnStatus: "Eligible - Technical Issue", exchangeEligible: true }),
  C("ORD-1048", "Portable SSD", 9499, "Delivered", { returnStatus: "Requested", refundStatus: "Pending", refundAmount: 9499, refundId: "RF-10048", exchangeEligible: true }),
  C("ORD-1049", "Graphic Drawing Pen", 1999, "Processing", { cancellationEligible: true }),
  C("ORD-1050", "Noise Cancelling Headphones", 7999, "Delivered", { returnStatus: "Eligible", exchangeEligible: true }),
  // Preserved canonical duplicate-payment demo case.
  C("ORD-4821", "Wireless Headphones", 2499, "Cancelled", { paymentStatus: "Captured (duplicate)" }),
];

export function findCustomerOrder(id?: string | null): CustomerOrder | undefined {
  if (!id) return undefined;
  return CUSTOMER_ORDERS.find((o) => o.id === id.toUpperCase());
}

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
