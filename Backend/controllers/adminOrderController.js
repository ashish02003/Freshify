import OrderModel from "../Models/OrderModel.js";


// Get all orders for admin with detailed information
export async function getAllOrdersForAdmin(request, response) {
    try {
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const orders = await OrderModel
            .find({})
            .populate({
                path: 'userId',
                select: 'name email mobile'
            })
            .populate({
                path: 'productId',
                select: 'name price image category'
            })
            .populate({
                path: 'delivery_address',
                select: 'address_line city state country pincode mobile'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrders = await OrderModel.countDocuments();

        return response.json({
            message: "All orders fetched successfully",
            error: false,
            success: true,
            data: orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders: totalOrders,
                hasMore: page < Math.ceil(totalOrders / limit)
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get order details by order ID for admin
export async function getOrderByIdForAdmin(request, response) {
    try {
        const { orderId } = request.params;

        const order = await OrderModel
            .findOne({ orderId: orderId })
            .populate({
                path: 'userId',
                select: 'name email mobile avatar'
            })
            .populate({
                path: 'productId',
                select: 'name price image category description'
            })
            .populate({
                path: 'delivery_address',
                select: 'address_line city state country pincode mobile'
            });

        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Order details fetched successfully",
            error: false,
            success: true,
            data: order
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Update order status (for tracking)
export async function updateOrderStatus(request, response) {
    try {
        const { orderId } = request.params;
        const { status, delivery_status, estimated_delivery } = request.body;

        const updateData = {};
        if (status) updateData.payment_status = status;
        if (delivery_status) updateData.delivery_status = delivery_status;
        if (estimated_delivery) updateData.estimated_delivery = estimated_delivery;

        const updatedOrder = await OrderModel
            .findOneAndUpdate(
                { orderId: orderId },
                { 
                    ...updateData,
                    updatedAt: new Date()
                },
                { new: true }
            )
            .populate('userId', 'name email mobile')
            .populate('productId', 'name price image')
            .populate('delivery_address');

        if (!updatedOrder) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Order status updated successfully",
            error: false,
            success: true,
            data: updatedOrder
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get orders by status
export async function getOrdersByStatus(request, response) {
    try {
        const { status } = request.params;
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await OrderModel
            .find({ delivery_status: status })
            .populate('userId', 'name email mobile')
            .populate('productId', 'name price image')
            .populate('delivery_address')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrders = await OrderModel.countDocuments({ delivery_status: status });

        return response.json({
            message: `Orders with status ${status} fetched successfully`,
            error: false,
            success: true,
            data: orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders: totalOrders
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Get order statistics for admin dashboard
export async function getOrderStatistics(request, response) {
    try {
        const totalOrders = await OrderModel.countDocuments();
        const pendingOrders = await OrderModel.countDocuments({ delivery_status: 'pending' });
        const processingOrders = await OrderModel.countDocuments({ delivery_status: 'processing' });
        const shippedOrders = await OrderModel.countDocuments({ delivery_status: 'shipped' });
        const deliveredOrders = await OrderModel.countDocuments({ delivery_status: 'delivered' });
        const cancelledOrders = await OrderModel.countDocuments({ delivery_status: 'cancelled' });

        // Calculate total revenue
        const revenueResult = await OrderModel.aggregate([
            { $match: { delivery_status: { $ne: 'cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmt' } } }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        return response.json({
            message: "Order statistics fetched successfully",
            error: false,
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


