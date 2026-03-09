/**
 * Generate a unique order number like ORD-0001, ORD-0002, etc.
 */
let counter = 0;

export function generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, "0");
    return `ORD-${year}${month}${random}`;
}
