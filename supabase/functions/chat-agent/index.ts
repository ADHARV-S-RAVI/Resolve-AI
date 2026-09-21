const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-session-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AI_MODEL = "deepseek/deepseek-v4-flash";
const AI_ENDPOINT =
  "https://api.enter.pro/code/api/v1/ai/chat/completions";
const AI_TOKEN_SECRET = "AI_API_TOKEN_1ba05262425a";
const AI_PROJECT_ID = "1ba05262425a42faa86660090bc3d913";

type ConversationMessage = {
  role: "user" | "model";
  content: string;
};

// ------------------------------------------------------------
// SEEDED DEMO BUSINESS DATASET
// ------------------------------------------------------------
// A deterministic, internally consistent, fully fictional dataset:
// ~50 orders (ORD-1001..ORD-1050) plus the preserved ORD-4821
// duplicate-payment case. Every order has a unique id, every payment
// a unique TX id, every refund a unique RF id. The AI investigation
// layer injects only the orders referenced in the conversation.
// ------------------------------------------------------------

type DemoOrder = {
  id: string;
  customerId: string;
  customerName: string;
  product: string;
  amount: number;
  currency: string;
  orderDate: string;
  shippedDate: string | null;
  deliveredDate: string | null;
  expectedDelivery: string | null;
  status: string;
  paymentStatus: string;
  transactionId: string;
  returnStatus: string;
  refundStatus: string;
  refundAmount: number | null;
  refundId: string | null;
  cancellationEligible: boolean;
  exchangeEligible: boolean;
  scenario: string;
  payments: { id: string; amount: number; status: string }[];
  refunds: { id: string; amount: number; status: string }[];
};

// Compact factory for the exact master dataset records.
function M(
  id: string,
  customerId: string,
  product: string,
  amount: number,
  orderDate: string,
  shipped: string | null,
  delivered: string | null,
  expected: string | null,
  status: string,
  tx: string,
  ret: string,
  ref: string,
  refAmt: number | null,
  refId: string | null,
  cancel: boolean,
  exch: boolean,
  scenario: string,
): DemoOrder {
  return {
    id,
    customerId,
    customerName: `Customer ${customerId}`,
    product,
    amount,
    currency: "INR",
    orderDate,
    shippedDate: shipped,
    deliveredDate: delivered,
    expectedDelivery: expected,
    status,
    paymentStatus: "Paid",
    transactionId: tx,
    returnStatus: ret,
    refundStatus: ref,
    refundAmount: refAmt,
    refundId: refId,
    cancellationEligible: cancel,
    exchangeEligible: exch,
    scenario,
    payments: [{ id: tx, amount, status: "Paid" }],
    refunds: refId ? [{ id: refId, amount: refAmt ?? amount, status: ref }] : [],
  };
}

// EXACT FINAL MASTER DATASET — 50 orders, single source of truth.
const MASTER_ORDERS: DemoOrder[] = [
  M("ORD-1001", "C-1001", "Mechanical Keyboard", 4999, "2026-08-20", "2026-08-21", "2026-08-24", null, "Delivered", "TX-10001", "Eligible", "None", null, null, false, true, "Customer received keyboard and wants return"),
  M("ORD-1002", "C-1002", "Wireless Mouse", 1499, "2026-09-12", "2026-09-13", null, "2026-09-19", "Shipped", "TX-10002", "Not Applicable", "None", null, null, false, false, "Customer asks for order status"),
  M("ORD-1003", "C-1003", "Bluetooth Headphones", 2999, "2026-09-10", "2026-09-11", null, "2026-09-19", "Out for Delivery", "TX-10003", "Not Applicable", "None", null, null, false, false, "Customer wants current delivery status"),
  M("ORD-1004", "C-1004", "Gaming Monitor", 18999, "2026-08-15", "2026-08-16", "2026-08-19", null, "Delivered", "TX-10004", "Requested", "Pending", 18999, "RF-10004", false, true, "Customer returned monitor and is waiting for refund"),
  M("ORD-1005", "C-1005", "USB-C Hub", 2199, "2026-08-25", "2026-08-26", "2026-08-29", null, "Delivered", "TX-10005", "Eligible", "None", null, null, false, true, "Customer received hub and asks about return options"),
  M("ORD-1006", "C-1006", "Laptop Stand", 1899, "2026-08-22", "2026-08-23", "2026-08-26", null, "Delivered", "TX-10006", "Eligible - Damaged", "None", null, null, false, true, "Customer received a damaged laptop stand"),
  M("ORD-1007", "C-1007", "Backpack", 2499, "2026-09-01", "2026-09-02", null, "2026-09-20", "Shipped", "TX-10007", "Not Applicable", "None", null, null, false, false, "Customer asks when backpack will arrive"),
  M("ORD-1008", "C-1008", "Smartwatch", 5499, "2026-08-10", "2026-08-11", "2026-08-14", null, "Delivered", "TX-10008", "Completed", "Completed", 5499, "RF-10008", false, true, "Customer asks about completed smartwatch refund"),
  M("ORD-1009", "C-1009", "Wireless Earbuds", 3499, "2026-08-28", "2026-08-29", "2026-09-01", null, "Delivered", "TX-10009", "Requested", "Pending", 3499, "RF-10009", false, true, "Customer says refund has not arrived"),
  M("ORD-1010", "C-1010", "External SSD", 7999, "2026-08-18", "2026-08-19", "2026-08-22", null, "Delivered", "TX-10010", "Eligible", "None", null, null, false, true, "Customer asks to return SSD"),
  M("ORD-1011", "C-1011", "Webcam", 3299, "2026-08-30", "2026-08-31", "2026-09-03", null, "Delivered", "TX-10011", "Eligible - Wrong Item", "None", null, null, false, true, "Customer received the wrong webcam model"),
  M("ORD-1012", "C-1012", "Mechanical Gaming Keyboard", 6499, "2026-09-05", "2026-09-06", null, "2026-09-21", "Shipped", "TX-10012", "Not Applicable", "None", null, null, false, false, "Customer asks for keyboard delivery status"),
  M("ORD-1013", "C-1013", "Power Bank", 1799, "2026-09-14", null, null, "2026-09-20", "Processing", "TX-10013", "Not Applicable", "None", null, null, true, false, "Customer wants to cancel power bank before shipment"),
  M("ORD-1014", "C-1014", "Gaming Mouse", 2799, "2026-09-15", null, null, "2026-09-22", "Processing", "TX-10014", "Not Applicable", "None", null, null, true, false, "Customer requests order cancellation"),
  M("ORD-1015", "C-1015", "Laptop Cooling Pad", 2299, "2026-09-16", null, null, "2026-09-23", "Just Placed", "TX-10015", "Not Applicable", "None", null, null, true, false, "Customer wants immediate cancellation after placing order"),
  M("ORD-1016", "C-1016", "27-inch 4K Monitor", 29999, "2026-08-05", "2026-08-06", "2026-08-09", null, "Delivered", "TX-10016", "Eligible", "None", null, null, false, true, "Customer reports display problem and requests return"),
  M("ORD-1017", "C-1017", "USB-C Cable", 699, "2026-09-08", "2026-09-09", null, "2026-09-18", "Out for Delivery", "TX-10017", "Not Applicable", "None", null, null, false, false, "Customer asks if cable will arrive today"),
  M("ORD-1018", "C-1018", "Portable Bluetooth Speaker", 3999, "2026-08-12", "2026-08-13", "2026-08-16", null, "Delivered", "TX-10018", "Completed", "Completed", 3999, "RF-10018", false, true, "Customer asks about completed speaker return and refund"),
  M("ORD-1019", "C-1019", "Wireless Keyboard", 2499, "2026-09-13", null, null, "2026-09-20", "Processing", "TX-10019", "Not Applicable", "None", null, null, true, false, "Customer wants to cancel before dispatch"),
  M("ORD-1020", "C-1020", "Gaming Headset", 4499, "2026-09-08", "2026-09-09", null, "2026-09-16", "Delayed", "TX-10020", "Not Applicable", "None", null, null, false, false, "Customer complains that delivery is delayed"),
  M("ORD-1021", "C-1021", "Office Chair", 8999, "2026-09-17", null, null, "2026-09-24", "Just Placed", "TX-10021", "Not Applicable", "None", null, null, true, false, "Customer wants to cancel newly placed office chair"),
  M("ORD-1022", "C-1022", "Smartphone", 24999, "2026-08-20", "2026-08-21", "2026-08-24", null, "Delivered", "TX-10022", "Eligible - Damaged", "None", null, null, false, true, "Customer received damaged smartphone and wants exchange"),
  M("ORD-1023", "C-1023", "Tablet", 19999, "2026-08-22", "2026-08-23", "2026-08-26", null, "Delivered", "TX-10023", "Eligible - Wrong Item", "None", null, null, false, true, "Customer received wrong tablet and wants exchange"),
  M("ORD-1024", "C-1024", "Smart TV", 34999, "2026-08-01", "2026-08-02", "2026-08-05", null, "Delivered", "TX-10024", "Eligible", "None", null, null, false, true, "Customer wants to return Smart TV within return window"),
  M("ORD-1025", "C-1025", "Laptop", 64999, "2026-08-25", "2026-08-26", "2026-08-29", null, "Delivered", "TX-10025", "Eligible - Damaged", "None", null, null, false, true, "Customer reports damaged laptop and requests exchange"),
  M("ORD-1026", "C-1026", "Printer", 12999, "2026-08-10", "2026-08-11", "2026-08-14", null, "Delivered", "TX-10026", "Eligible", "None", null, null, false, true, "Customer wants to return printer because it is defective"),
  M("ORD-1027", "C-1027", "Wi-Fi Router", 3499, "2026-07-20", "2026-07-21", "2026-07-24", null, "Delivered", "TX-10027", "Expired", "None", null, null, false, false, "Customer requests return after return window expired"),
  M("ORD-1028", "C-1028", "Smart Bulb", 899, "2026-08-28", "2026-08-29", "2026-09-01", null, "Delivered", "TX-10028", "Requested", "Pending", 899, "RF-10028", false, true, "Customer asks for update on smart bulb return"),
  M("ORD-1029", "C-1029", "Power Strip", 1299, "2026-08-30", "2026-08-31", "2026-09-03", null, "Delivered", "TX-10029", "Not Applicable", "None", null, null, false, true, "Customer reports defective power strip and wants exchange"),
  M("ORD-1030", "C-1030", "External Hard Drive", 5999, "2026-08-15", "2026-08-16", "2026-08-19", null, "Delivered", "TX-10030", "Eligible", "None", null, null, false, true, "Customer wants to return hard drive"),
  M("ORD-1031", "C-1031", "Drawing Tablet", 8499, "2026-09-03", "2026-09-04", null, "2026-09-12", "Delayed", "TX-10031", "Not Applicable", "None", null, null, false, false, "Customer reports delayed delivery"),
  M("ORD-1032", "C-1032", "Fitness Band", 2999, "2026-08-18", "2026-08-19", "2026-08-22", null, "Delivered", "TX-10032", "Eligible", "None", null, null, false, true, "Customer wants to return fitness band"),
  M("ORD-1033", "C-1033", "Soundbar", 11999, "2026-08-05", "2026-08-06", "2026-08-09", null, "Delivered", "TX-10033", "Eligible - Damaged", "None", null, null, false, true, "Customer received damaged soundbar and requests exchange"),
  M("ORD-1034", "C-1034", "USB Microphone", 6999, "2026-08-25", "2026-08-26", "2026-08-29", null, "Delivered", "TX-10034", "Eligible", "None", null, null, false, true, "Customer wants to return microphone"),
  M("ORD-1035", "C-1035", "Camera Tripod", 2499, "2026-09-06", "2026-09-07", null, "2026-09-15", "Undelivered", "TX-10035", "Not Applicable", "None", null, null, false, false, "Customer says tripod has not arrived by expected date"),
  M("ORD-1036", "C-1036", "Digital Camera", 39999, "2026-08-10", "2026-08-11", "2026-08-14", null, "Delivered", "TX-10036", "Eligible - Wrong Item", "None", null, null, false, true, "Customer received wrong camera and requests exchange"),
  M("ORD-1037", "C-1037", "Portable Projector", 15999, "2026-08-20", "2026-08-21", "2026-08-24", null, "Delivered", "TX-10037", "Eligible", "None", null, null, false, true, "Customer reports projector issue and requests return"),
  M("ORD-1038", "C-1038", "Electric Kettle", 1599, "2026-09-14", null, null, "2026-09-21", "Just Placed", "TX-10038", "Not Applicable", "None", null, null, true, false, "Customer wants to cancel kettle order"),
  M("ORD-1039", "C-1039", "Coffee Maker", 4999, "2026-08-28", "2026-08-29", "2026-09-01", null, "Delivered", "TX-10039", "Eligible", "None", null, null, false, true, "Customer wants to return coffee maker"),
  M("ORD-1040", "C-1040", "Air Purifier", 13999, "2026-08-12", "2026-08-13", "2026-08-16", null, "Delivered", "TX-10040", "Eligible - Damaged", "None", null, null, false, true, "Customer received damaged air purifier and wants replacement"),
  M("ORD-1041", "C-1041", "Desk Lamp", 1299, "2026-09-10", null, null, "2026-09-18", "Processing", "TX-10041", "Not Applicable", "None", null, null, true, false, "Customer wants to cancel desk lamp before dispatch"),
  M("ORD-1042", "C-1042", "Monitor Stand", 2799, "2026-08-15", "2026-08-16", "2026-08-19", null, "Delivered", "TX-10042", "Eligible", "None", null, null, false, true, "Customer asks for return of monitor stand"),
  M("ORD-1043", "C-1043", "USB Flash Drive", 999, "2026-09-11", "2026-09-12", null, "2026-09-19", "Shipped", "TX-10043", "Not Applicable", "None", null, null, false, false, "Customer asks for flash drive tracking/status"),
  M("ORD-1044", "C-1044", "Gaming Controller", 4299, "2026-08-22", "2026-08-23", "2026-08-26", null, "Delivered", "TX-10044", "Eligible - Defective", "None", null, null, false, true, "Customer reports controller defect and requests exchange"),
  M("ORD-1045", "C-1045", "VR Headset", 32999, "2026-08-01", "2026-08-02", "2026-08-05", null, "Delivered", "TX-10045", "Expired", "None", null, null, false, false, "Customer requests return after return period"),
  M("ORD-1046", "C-1046", "Smartphone Charger", 1499, "2026-09-13", "2026-09-14", null, "2026-09-20", "Shipped", "TX-10046", "Not Applicable", "None", null, null, false, false, "Customer asks for delivery status"),
  M("ORD-1047", "C-1047", "Smart Doorbell", 7499, "2026-08-18", "2026-08-19", "2026-08-22", null, "Delivered", "TX-10047", "Eligible - Technical Issue", "None", null, null, false, true, "Customer reports technical issue and requests human support"),
  M("ORD-1048", "C-1048", "Portable SSD", 9499, "2026-08-20", "2026-08-21", "2026-08-24", null, "Delivered", "TX-10048", "Requested", "Pending", 9499, "RF-10048", false, true, "Customer asks why SSD refund is still pending"),
  M("ORD-1049", "C-1049", "Graphic Drawing Pen", 1999, "2026-09-15", null, null, "2026-09-22", "Processing", "TX-10049", "Not Applicable", "None", null, null, true, false, "Customer wants to cancel drawing pen before shipment"),
  M("ORD-1050", "C-1050", "Noise Cancelling Headphones", 7999, "2026-08-08", "2026-08-09", "2026-08-12", null, "Delivered", "TX-10050", "Eligible", "None", null, null, false, true, "Customer wants to return headphones"),
];

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const BUSINESS_ORDERS: DemoOrder[] = [
  // Preserved canonical duplicate-payment demo case.
  {
    id: "ORD-4821",
    customerId: "C-10482",
    customerName: "Adharv Sharma",
    product: "Wireless Headphones",
    amount: 2499,
    currency: "INR",
    orderDate: "2026-09-10",
    shippedDate: "2026-09-11",
    deliveredDate: null,
    expectedDelivery: "2026-09-18",
    status: "Cancelled",
    paymentStatus: "Captured (duplicate)",
    transactionId: "TX-92840",
    returnStatus: "Not Applicable",
    refundStatus: "None",
    refundAmount: null,
    refundId: null,
    cancellationEligible: false,
    exchangeEligible: false,
    scenario: "Duplicate payment on a cancelled order (POL-004 refund eligible)",
    payments: [
      { id: "TX-92840", amount: 2499, status: "Captured" },
      { id: "TX-92841", amount: 2499, status: "Captured" },
    ],
    refunds: [],
  },
  ...MASTER_ORDERS,
];

const REFUND_POLICY = {
  id: "POL-004",
  result: "Duplicate payment eligible",
};

function extractOrderIds(text: string): string[] {
  const ids =
    text.match(/ORD-\d{4,}/gi)?.map((m) => m.toUpperCase()) ?? [];
  return Array.from(new Set(ids));
}

function findCustomerId(
  text: string,
  orders: DemoOrder[],
): string | null {
  const m = text.match(/C-\d{4,}/i);
  if (m) return m[0].toUpperCase();
  return orders[0]?.customerId ?? null;
}

// Product-name lookup: match an order by its product name when the
// customer does not know their order ID. Matches when the query contains
// the full product name, the product contains the query, or the query
// contains any contiguous multi-word phrase of the product. Master
// dataset products are unique, so a match is deterministic.
function findOrdersByProduct(text: string): DemoOrder[] {
  const q = text.toLowerCase();
  if (!q) return [];

  const matches = BUSINESS_ORDERS.filter((o) => {
    const p = o.product.toLowerCase();
    if (p.includes(q) || q.includes(p)) return true;

    const words = p.split(/\s+/).filter(Boolean);
    for (let k = 2; k <= words.length; k++) {
      for (let i = 0; i + k <= words.length; i++) {
        if (q.includes(words.slice(i, i + k).join(" "))) {
          return true;
        }
      }
    }
    return false;
  });

  return matches;
}

function customerOrderSummary(customerId: string): string {
  const list = BUSINESS_ORDERS.filter(
    (o) => o.customerId === customerId,
  ).map((o) => ({
    id: o.id,
    product: o.product,
    status: o.status,
    amount: rupee(o.amount),
    paymentStatus: o.paymentStatus,
    refundStatus: o.refundStatus,
    returnStatus: o.returnStatus,
  }));

  return JSON.stringify(list);
}

function orderToJson(o: DemoOrder) {
  return {
    id: o.id,
    customer: { id: o.customerId, name: o.customerName },
    product: o.product,
    amount: rupee(o.amount),
    currency: o.currency,
    orderDate: o.orderDate,
    shippedDate: o.shippedDate,
    deliveredDate: o.deliveredDate,
    expectedDelivery: o.expectedDelivery,
    status: o.status,
    paymentStatus: o.paymentStatus,
    transactionId: o.transactionId,
    returnStatus: o.returnStatus,
    refundStatus: o.refundStatus,
    refundAmount: o.refundAmount !== null ? rupee(o.refundAmount) : null,
    refundId: o.refundId,
    cancellationEligible: o.cancellationEligible,
    exchangeEligible: o.exchangeEligible,
    scenario: o.scenario,
    payments: o.payments.map((p) => ({
      id: p.id,
      amount: rupee(p.amount),
      status: p.status,
    })),
    refunds: o.refunds.map((r) => ({
      id: r.id,
      amount: rupee(r.amount),
      status: r.status,
    })),
  };
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // Only POST is supported
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const body = await req.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const conversationHistory: ConversationMessage[] =
      Array.isArray(body?.conversation_history)
        ? body.conversation_history
            .filter(
              (item: unknown) =>
                typeof item === "object" &&
                item !== null &&
                typeof (item as { role?: unknown }).role ===
                  "string" &&
                typeof (
                  item as { content?: unknown }
                ).content === "string",
            )
            .map(
              (item: {
                role: string;
                content: string;
              }) => ({
                role:
                  item.role === "model"
                    ? ("model" as const)
                    : ("user" as const),
                content: item.content,
              }),
            )
        : [];

    if (!message) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Message is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const AI_API_TOKEN = Deno.env.get(AI_TOKEN_SECRET);

    if (!AI_API_TOKEN) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "AI API token is not configured",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // ------------------------------------------------------------
    // ORDER LOOKUP FROM SEEDED BUSINESS DATASET
    // ------------------------------------------------------------
    const conversationText = [
      ...conversationHistory.map((i) => i.content),
      message,
      typeof body?.order_id === "string" ? body.order_id : "",
    ].join(" ");

    const referencedIds = extractOrderIds(conversationText);
    const matchedOrders = BUSINESS_ORDERS.filter((o) =>
      referencedIds.includes(o.id),
    );

    // When no order ID is given, try to identify the order by product name.
    const productMatchedOrders = matchedOrders.length
      ? []
      : findOrdersByProduct(conversationText);

    // Canonical regression: a duplicate-charge + cancelled-order complaint
    // with no order ID/product maps to the preserved ORD-4821 demo case.
    const duplicatePaymentPattern =
      /(deducted|charged)\s+twice|two\s+(charges|payments|transactions)/i;

    const fallback4821 =
      matchedOrders.length === 0 &&
      productMatchedOrders.length === 0 &&
      duplicatePaymentPattern.test(conversationText)
        ? [BUSINESS_ORDERS.find((o) => o.id === "ORD-4821")!]
        : [];

    const injectOrders = matchedOrders.length
      ? matchedOrders
      : productMatchedOrders.length
        ? productMatchedOrders
        : fallback4821;

    const customerId = findCustomerId(
      conversationText,
      injectOrders,
    );

    const injectedOrders = injectOrders.length
      ? JSON.stringify(injectOrders.map(orderToJson))
      : null;

    // Refund-conflict fallback: when the customer reports a refund that was
    // completed but not received (and no order could be identified), give the
    // AI the demo customer's order summary so it can investigate and escalate.
    const refundConflictPattern =
      /refund\b.*(not received|haven'?t received|missing|not credited|conflict)|(not received|haven'?t received).*refund/i;

    const refundConflictSummary =
      injectOrders.length === 0 &&
      refundConflictPattern.test(conversationText)
        ? customerOrderSummary("C-10482")
        : null;

    const injectedSummary =
      customerId
        ? customerOrderSummary(customerId)
        : refundConflictSummary;

    const systemInstruction = `
You are ResolveAI, an intelligent AI customer-support agent.

Your job is to:
1. Understand the customer's complaint.
2. Use the provided demo business data when relevant.
3. Ask only for information that is actually missing.
4. Avoid asking for information already provided.
5. Investigate the complaint when sufficient demo data is available.
6. Explain the investigation clearly.
7. Recommend an appropriate next step.
8. Escalate when information conflicts or human judgment is required.

IMPORTANT:

- The business records below are DEMO DATA for the ResolveAI hackathon.
- You may use these records as connected business data for this prototype.
- Never invent additional orders, payments, refunds, policies, or records.
- Never claim that a real refund has been executed.
- "Refund recommended" means only that a refund is recommended.
- If the customer reports that a refund is already pending or the information
  conflicts with the provided records, recommend human review instead of
  automatically recommending another refund.
- Keep responses concise, professional, friendly, and natural.

ORDER LOOKUP BY PRODUCT NAME:

- If the customer describes an order by product name but does not provide
  an order ID, identify the order using the CUSTOMER ORDER RECORDS block.
- If exactly one order matches the product name, answer directly using that
  order's actual data. Do NOT ask for the order ID.
- If multiple orders match the product name, do NOT guess. List the matching
  order IDs and their statuses, and ask the customer to confirm which one.
- If no order matches the product name, then ask the customer for their order
  ID or more information. Never invent order details.

CUSTOMER ORDER RECORDS (SEEDED DEMO BUSINESS DATA):

${
  injectedOrders ??
  "No order records matched this conversation yet. Ask the customer for their order ID (format ORD-XXXX) or the product name when you need order details."
}

CUSTOMER ORDER SUMMARY:
${
  injectedSummary ??
  "None — no customer identified yet. Ask the customer for their order ID or product name."
}

Refund policy:
${JSON.stringify(REFUND_POLICY)}

INVESTIGATION REFERENCE:

If the customer is discussing the duplicate-payment case for ORD-4821:

Order:
ORD-4821 → Cancelled

Payments:
TX-92840 → Captured → ₹2,499
TX-92841 → Captured → ₹2,499

Refund policy:
POL-004 → Duplicate payment eligible

Investigation:
5 investigation steps completed
Confidence: 91%
Decision: Refund recommended

Root cause:
A payment gateway timeout may have caused a duplicate transaction.

For any other order the customer references, investigate using the
CUSTOMER ORDER RECORDS block above and state what you actually found.

If the customer reports a conflicting refund status, such as a bank showing
a refund as pending, the case should be treated as requiring human review.

CANCELLATION POLICY:

- Use the order's "cancellationEligible" field as authoritative.
- If cancellationEligible is true (order status "Just Placed" or "Processing"), cancellation
  may proceed.
- If cancellationEligible is false:
  - "Shipped" / "Out for Delivery": explain that cancellation is no longer available once
    shipped, and offer a return after delivery if eligible.
  - "Delivered": do NOT offer cancellation. Offer a return/refund per the return policy.
  - Already "Cancelled": explain that the order is already cancelled and provide refund
    information if applicable.
  - Other statuses: explain why cancellation is unavailable.
- Always use the exact order status from the CUSTOMER ORDER RECORDS block. Never invent
  or override the status.

RETURN POLICY:

- Use the order's "returnStatus" field as authoritative:
  - "Eligible" / "Eligible - Damaged" / "Eligible - Wrong Item" / "Eligible - Defective" /
    "Eligible - Technical Issue": a return/refund/exchange process can begin.
  - "Expired": the standard return window has expired — explain that; an exception requires
    human review (escalate to "Returns & Refunds").
  - "Requested": a return request already exists — tell the customer it is in progress.
  - "Completed": the return/refund is already completed.
  - "Not Applicable": return is not available for this order state.
- Use "exchangeEligible" for exchange eligibility.
- Use "refundStatus" ("None" / "Pending" / "Completed"), "refundAmount" and "refundId" for
  refund state.

CUSTOMER-SIDE ACTIONS (cancel / return / exchange / refund):

When the customer explicitly requests a supported action, populate the "action" field:

- cancel:
  - cancellationEligible true → status "submitted", message "Your cancellation request has
    been submitted.", requestId "CNL-<ORDER>".
  - cancellationEligible false → status "not_allowed", message explaining why. Never claim
    the order was cancelled.
- return:
  - returnStatus is one of the Eligible variants → status "submitted", requestId "RET-<ORDER>",
    message "Your return request has been submitted."
  - "Requested" → status "already_requested", message that it is in progress.
  - "Expired" → status "not_allowed" with explanation (escalate for an exception).
  - "Completed" → status "completed", report the refund is already done.
  - "Not Applicable" → status "not_allowed".
- exchange:
  - exchangeEligible true → status "submitted", requestId "EXC-<ORDER>".
  - otherwise → status "not_allowed" with an alternative or escalation.
- refund:
  - A refund does NOT require the product to be returned first.
  - Do NOT block or refuse a refund request because the return status is Requested or
    Pending, or because another refund is already pending or in progress.
  - When the customer asks for a refund, identify the order and let the refund request
    proceed to the agent: status "submitted", requestId "RF-<ORDER>", message "Your refund
    request has been sent to our support team for approval."
  - "Completed" → status "completed" (already refunded) and report the refund details.
  - Do NOT escalate a straightforward refund request — the agent approves it.
- escalate: customer requests a human → set escalation.required true and action.type "escalate".

SAFETY:

- Never claim a real cancellation, return, refund, or payment action occurred unless the
  record shows it (e.g., refundStatus "Completed") or a sandbox request was explicitly
  submitted.
- Use "Your order is eligible for cancellation." / "Your cancellation request has been
  submitted." / "I can help you submit the cancellation request."
- Never say "Your order has been cancelled" unless the action actually happened.
- All refunds/returns/exchanges are sandbox requests; no real money moves.

ESCALATION TO A HUMAN:

- Escalate only when human intervention is genuinely required:
  - Conflicting payment or refund records.
  - Conflicting information from previous support.
  - Return eligibility is unclear or requires an exception.
  - Refund status conflicts between systems.
  - The customer explicitly asks to talk to a human.
  - Repeated failed resolution.
  - Complex cases requiring manual investigation.
- Do NOT escalate simple eligible cancellations, returns, or refunds — handle those
  with the AI.
- When escalating, preserve the complete case context: conversation/history,
  customer ID, order ID, product, order status, payment information, refund
  information, investigation steps, evidence, policy checked, AI recommendation,
  and escalation reason. The human agent must not need the customer to repeat
  the problem.
- If a customer says a refund was completed but they have not received it, or reports
  refund information that conflicts with available records, set escalation.required
  to true with team "Payments Support" and reason "Refund status requires human
  reconciliation because available records conflict."
- If the customer explicitly asks to talk to a human, set escalation.required to
  true and use the appropriate team ("Customer Support" if no specific team applies).
- Choose the escalation team by issue: "Payments Support" (payment/refund conflicts),
  "Returns & Refunds" (return eligibility/exceptions), "Delivery Support" (delivery
  issues), "Technical Support" (product/technical issues), "Customer Support" (general).

Do not execute any real financial action.

RESPONSE FORMAT:

Your response must contain ONLY valid JSON.

Use exactly this structure:

{
  "reply": "Your natural-language response to the customer.",
  "investigation": {
    "found": true,
    "steps": [],
    "evidence": [],
    "confidence": 0,
    "decision": "",
    "rootCause": "",
    "status": ""
  },
  "escalation": {
    "required": false,
    "reason": "",
    "team": ""
  },
  "action": {
    "type": "cancel" | "return" | "exchange" | "refund" | "escalate" | null,
    "orderId": "ORD-xxxx",
    "status": "submitted" | "not_allowed" | "already_requested" | "pending" | "completed" | null,
    "requestId": "CNL-ORD-xxxx | RET-ORD-xxxx | EXC-ORD-xxxx | RF-ORD-xxxx | null",
    "message": "Short confirmation message or null"
  }
}

RULES FOR THE JSON:

- "reply" must contain the customer-facing response.
- "investigation" should be populated when relevant business data was found.
- If no investigation can yet be performed, use:
  "found": false
  and empty arrays/strings with confidence 0.
- "steps" should contain the investigation steps actually relevant to the case.
- "evidence" should contain objects with:
  source, reference, result
- "confidence" should be a number from 0 to 100.
- "decision" should describe the recommended action.
- "rootCause" should contain the known or suspected cause only when supported
  by the provided demo data.
- "status" should describe the current case state.
- "escalation.required" must be true when human review is needed.
- When escalation is required, use:
  team: "Payments Support"
- "action" must be null unless the customer explicitly requested a supported action
  (cancel / return / exchange / refund / escalate). Follow the CUSTOMER-SIDE ACTIONS rules.
- Only "submitted" or "completed" action states mean the request was recorded — never
  fabricate them. Use "not_allowed" with an explanation otherwise.
- "requestId" should follow the pattern CNL-/RET-/EXC-/RF-<ORDER> for submitted requests.
- Do not put markdown code fences around the JSON.
- Do not add any text before or after the JSON.
`;

    // Build OpenAI chat-completions style messages.
    // Frontend history uses role "model" — map it to "assistant".
    const messages = [
      {
        role: "system" as const,
        content: systemInstruction,
      },
      ...conversationHistory.map((item) => ({
        role:
          item.role === "model"
            ? ("assistant" as const)
            : ("user" as const),
        content: item.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    const upstreamSessionID =
      req.headers.get("X-Session-ID")?.trim() ||
      crypto.randomUUID();

    // Call Enter AI gateway (Qwen via EnterPro) — stream: false so we
    // receive a complete JSON body to parse the structured contract.
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
        "X-Session-ID": upstreamSessionID,
        "X-Enter-Project-ID": AI_PROJECT_ID,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        stream: false,
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Enter AI error:", result);

      return new Response(
        JSON.stringify({
          ok: false,
          error: "AI request failed",
          details:
            result?.error?.message ??
            "Unknown AI gateway error",
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const rawText =
      result?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!rawText) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "AI returned an empty response",
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Strip optional Markdown JSON fences and surrounding whitespace before parsing.
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: {
      reply?: string;
      investigation?: {
        found?: boolean;
        steps?: string[];
        evidence?: {
          source: string;
          reference: string;
          result: string;
        }[];
        confidence?: number;
        decision?: string;
        rootCause?: string;
        status?: string;
      };
      escalation?: {
        required?: boolean;
        reason?: string;
        team?: string;
      };
      action?: {
        type?: string;
        orderId?: string;
        status?: string;
        requestId?: string;
        message?: string;
      };
    };

    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Failed to parse AI JSON:",
        parseError,
        rawText,
      );

      return new Response(
        JSON.stringify({
          ok: false,
          error: "AI returned invalid JSON",
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const investigation = parsed.investigation?.found
      ? {
          found: true,
          steps:
            parsed.investigation.steps ?? [],
          evidence:
            parsed.investigation.evidence ?? [],
          confidence:
            typeof parsed.investigation.confidence ===
            "number"
              ? parsed.investigation.confidence
              : 0,
          decision:
            parsed.investigation.decision ?? "",
          rootCause:
            parsed.investigation.rootCause ?? "",
          status:
            parsed.investigation.status ?? "",
        }
      : null;

    const escalation = {
      required:
        parsed.escalation?.required === true,
      reason:
        parsed.escalation?.reason ?? "",
      team:
        parsed.escalation?.team ?? "",
    };

    // Enrich the customer action with a deterministic sandbox request ID.
    const rawAction = parsed.action;
    let action: null | {
      type: string;
      orderId: string | null;
      status: string;
      requestId: string | null;
      message: string;
    } = null;

    if (rawAction && typeof rawAction.type === "string") {
      const type = rawAction.type;
      const orderId =
        typeof rawAction.orderId === "string"
          ? rawAction.orderId
          : injectOrders[0]?.id ?? null;
      const status =
        typeof rawAction.status === "string"
          ? rawAction.status
          : "eligible";
      const givenRequestId =
        typeof rawAction.requestId === "string"
          ? rawAction.requestId
          : "";
      const requestId =
        status === "submitted" && orderId
          ? givenRequestId ||
            (type === "return"
              ? `RET-${orderId}`
              : type === "exchange"
                ? `EXC-${orderId}`
                : type === "cancel"
                  ? `CNL-${orderId}`
                  : type === "refund"
                    ? `RF-${orderId}`
                    : null)
          : null;

      action = {
        type,
        orderId,
        status,
        requestId,
        message:
          typeof rawAction.message === "string"
            ? rawAction.message
            : "",
      };
    }

    return new Response(
      JSON.stringify({
        ok: true,
        reply:
          parsed.reply ??
          "I couldn't generate a response. Please try again.",
        investigation,
        escalation,
        action,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("chat-agent error:", err);

    return new Response(
      JSON.stringify({
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Unexpected server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
