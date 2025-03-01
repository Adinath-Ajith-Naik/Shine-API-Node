const OrderCounter = require("../models/orderCounterSchema"); // Import the counter schema

const generateOrderNumber = async () => {
    try {
        const currentYear = new Date().getFullYear(); // Get the current year (e.g., 2025)

        // Find and update the counter document
        const counter = await OrderCounter.findOneAndUpdate(
            { _id: `invoice_${currentYear}` }, // Unique counter for each year
            { $inc: { seq: 1 } }, // Increment sequence by 1
            { new: true, upsert: true } // Create if not exists
        );

        // Format invoice number (e.g., INV-2025-0001)
        const orderNumber = `ORD-${currentYear}-${counter.seq.toString().padStart(4, "0")}`;

        return orderNumber;
    } catch (err) {
        console.error("Error generating invoice number:", err);
        throw new Error("Order number generation failed");
    }
};
