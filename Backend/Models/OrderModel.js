


import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product"
    },
    product_details: {
        name: String,
        image: Array,
    },
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        default: ""
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    subTotalAmt: {
        type: Number,
        default: 0
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    invoice_receipt: {
        type: String,
        default: ""
    },
    // New fields for live tracking
    delivery_status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    tracking_updates: [{
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
        },
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        location: String
    }],
    estimated_delivery: {
        type: Date
    },
    actual_delivery: {
        type: Date
    },
    delivery_partner: {
        name: String,
        phone: String,
        vehicle_number: String
    },
    tracking_number: {
        type: String,
        unique: true,
        sparse: true // allows multiple null values
    },
    order_notes: String,
    cancelled_reason: String,
    cancelled_by: {
        type: String,
        enum: ['customer', 'admin', 'system']
    }
}, {
    timestamps: true
});

// Add index for efficient querying
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ delivery_status: 1 });
orderSchema.index({ tracking_number: 1 });

// Pre-save middleware to generate tracking number
orderSchema.pre('save', function(next) {
    if (this.isNew && !this.tracking_number) {
        this.tracking_number = `TRK${this.orderId.replace('ORD-', '')}`;
    }
    next();
});

// Method to add tracking update
orderSchema.methods.addTrackingUpdate = function(status, message, location = '') {
    this.tracking_updates.push({
        status,
        message,
        location,
        timestamp: new Date()
    });
    this.delivery_status = status;
    return this.save();
};

const OrderModel = mongoose.model('order', orderSchema);

export default OrderModel;