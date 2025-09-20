



import { Router } from 'express'
import auth from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js' // You'll need to create this
import { 
    CashOnDeliveryOrderController, 
    getOrderDetailsController, 
    paymentController, 
    webhookStripe,
    updateOrderController,
    cancelOrderController
} from '../controllers/orderController.js'
import { 
    getAllOrdersForAdmin,
    getOrderByIdForAdmin,
    updateOrderStatus,
    getOrdersByStatus,
    getOrderStatistics
} from '../controllers/adminOrderController.js'
import OrderModel from '../Models/OrderModel.js'
const orderRouter = Router()

// Existing routes
orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController)
orderRouter.post('/checkout', auth, paymentController)
orderRouter.post('/webhook', webhookStripe)
orderRouter.get("/order-list", auth, getOrderDetailsController)

// New admin routes
orderRouter.get("/admin/all-orders", auth, adminAuth, getAllOrdersForAdmin)
orderRouter.get("/admin/order/:orderId", auth, adminAuth, getOrderByIdForAdmin)
orderRouter.put("/admin/order/:orderId/status", auth, adminAuth, updateOrderStatus)
orderRouter.get("/admin/orders/status/:status", auth, adminAuth, getOrdersByStatus)
orderRouter.get("/admin/statistics", auth, adminAuth, getOrderStatistics)

// User tracking route
orderRouter.get("/track/:orderId", auth, async (request, response) => {
    try {
        const { orderId } = request.params;
        const userId = request.userId;

        const order = await OrderModel
            .findOne({ 
                orderId: orderId, 
                userId: userId // Ensure user can only track their own orders
            })
            .populate('delivery_address')
            .select('orderId delivery_status tracking_updates estimated_delivery actual_delivery tracking_number delivery_partner');

        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Order tracking details",
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
});


// Cancel or update order (for customers)

orderRouter.put("/order/:orderId",auth, updateOrderController);
orderRouter.delete("/order/:orderId", auth,cancelOrderController);



export default orderRouter



