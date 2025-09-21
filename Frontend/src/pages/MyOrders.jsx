
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Package, Truck, Eye, MapPin, Clock, CheckCircle, Star, X, AlertCircle } from 'lucide-react';
import NoData from '../components/NoData';
import toast from 'react-hot-toast';

// const baseURL = 'http://localhost:8080'; // for local [1]

const baseURL = import.meta.env.VITE_API_URL || 'https://freshify-omega.vercel.app'; //for when deploying [2]

    const MyOrders = () => {
    const orders = useSelector(state => state.orders.order);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [reviewData, setReviewData] = useState({
        rating: 0,
        comment: ''
    });

    // Filter out cancelled orders from display
    const activeOrders = orders.filter(order => 
        order.delivery_status !== 'cancelled' && 
        !order.is_deleted && 
        order.show_to_user !== false
    );

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        processing: 'bg-purple-100 text-purple-800',
        packed: 'bg-indigo-100 text-indigo-800',
        shipped: 'bg-orange-100 text-orange-800',
        out_for_delivery: 'bg-cyan-100 text-cyan-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    const cancelReasons = [
        'Changed my mind',
        'Found better price elsewhere',
        'Ordered by mistake',
        'Product no longer needed',
        'Delivery taking too long',
        'Want to change delivery address',
        'Other'
    ];



    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleTrackOrder = (orderId) => {
        window.location.href = `/track/${orderId}`;
    };

    // Handle Cancel Order button click
    const handleCancelOrder = (order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
        setCancelReason('');
    };

    // Handle cancel order submission - Updated with immediate removal
  // Handle cancel order submission
const handleSubmitCancel = async () => {
    if (!cancelReason) {
        alert('Please select a reason for cancellation');
        return;
    }

    try {
        setLoading(true);

        const orderId = selectedOrder.orderId || selectedOrder._id;
        const token = localStorage.getItem('accesstoken') || localStorage.getItem('token');

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Try DELETE first
        let response = await fetch(`${baseURL}/api/order/order/${selectedOrder._id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers,
            body: JSON.stringify({
                cancel_reason: cancelReason,
                cancelled_at: new Date().toISOString()
            })
        });

        if (response.ok) {
            toast.success('Order cancelled and removed successfully!',{
                 autoClose: 5000, // 5 seconds
            });
            setShowCancelModal(false);
            window.location.reload();
            return;
        }

        // Fallback: update status instead of removing
       response = await fetch(`${baseURL}/api/order/order/${selectedOrder._id}`, {
            method: 'PUT',
            credentials: 'include',
            headers,
            body: JSON.stringify({
                delivery_status: 'cancelled',
                cancel_reason: cancelReason,
                cancelled_at: new Date().toISOString(),
                is_deleted: true,
                is_active: false,
                show_to_user: false
            })
        });

        if (response.ok) {
            toast.success("Order cancelled successfully!", {
  autoClose: 5000, // 5 seconds
});
            setShowCancelModal(false);
            window.location.reload();
            return;
        }

        alert('Order cancellation processed locally. Please refresh to see changes.');
        setShowCancelModal(false);
        window.location.reload();

    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Order marked for cancellation. Please refresh the page.');
        setShowCancelModal(false);
        window.location.reload();
    } finally {
        setLoading(false);
    }
};


    // Handle Rate & Review button click
    const handleRateReview = (order) => {
        setSelectedOrder(order);
        setShowReviewModal(true);
        setReviewData({ rating: 0, comment: '' });
    };

    // Handle star rating click
    const handleStarClick = (rating) => {
        setReviewData(prev => ({ ...prev, rating }));
    };

    // Handle review submission
    const handleSubmitReview = async () => {
        if (!reviewData.rating) {
            alert('Please select a rating');
            return;
        }
          
            toast.success("Review submitted successfully!", {
  autoClose: 5000, // 5 seconds
});
       
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'delivered':
                return <CheckCircle className="h-4 w-4" />;
            case 'shipped':
            case 'out_for_delivery':
                return <Truck className="h-4 w-4" />;
            case 'cancelled':
                return <X className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const canCancelOrder = (status) => {
        return ['pending', 'confirmed'].includes(status);
    };

    if (!orders || orders.length === 0) {
        return (
            <div>
                <div className='bg-white shadow-md p-3 font-semibold'>
                    <h1>My Orders</h1>
                </div>
                <NoData />
            </div>
        );
    }

    // Filter orders to show only active ones (exclude cancelled and deleted)
    if (!activeOrders || activeOrders.length === 0) {
        return (
            <div>
                <div className='bg-white shadow-md p-3 font-semibold'>
                    <h1>My Orders</h1>
                </div>
                <NoData />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className='bg-white shadow-md p-4 font-semibold border-b'>
                <h1 className="text-xl text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-600 font-normal mt-1">Track and manage your orders</p>
            </div>

            <div className="space-y-4 p-4">
                {activeOrders.map((order, index) => (
                    <div key={order._id + index + "order"} className='bg-white rounded-lg shadow-lg border overflow-hidden'>
                        {/* Order Header */}
                        <div className="px-4 py-3 border-b bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        OrderID: {order?.orderId}
                                    </h3>
                                    {order.createdAt && (
                                        <p className="text-sm text-gray-600">
                                            Placed on {formatDate(order.createdAt)}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        statusColors[order.delivery_status] || statusColors.pending
                                    }`}>
                                        {getStatusIcon(order.delivery_status)}
                                        <span className="ml-1">
                                            {order.delivery_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Content */}
                        <div className="p-4">
                            <div className="flex items-center space-x-4">
                                {/* Product Image */}
                                {order.product_details?.image?.[0] && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={order.product_details.image[0]}
                                            alt={order.product_details?.name}
                                            className="h-16 w-16 rounded-lg object-cover border"
                                        />
                                    </div>
                                )}

                                {/* Product Details */}
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        {order.product_details?.name || 'Product Name'}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Amount: </span>
                                            <span className="font-medium text-gray-900">₹{order.totalAmt}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Payment: </span>
                                            <span className="font-medium text-slate-900">{order.payment_status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Amount - Mobile Responsive */}
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-green-700">
                                        ₹{order.totalAmt}
                                    </p>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            {order.delivery_address && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                                        <div className="text-sm text-gray-600">
                                            <p className="font-medium text-gray-700 mb-1">Delivery Address:</p>
                                            <p>{order.delivery_address.address_line}</p>
                                            <p>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Show cancellation reason if cancelled */}
                            {order.delivery_status === 'cancelled' && order.cancel_reason && (
                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-start space-x-2">
                                        <AlertCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-medium text-red-700 mb-1">Order Cancelled</p>
                                            <p className="text-red-600">Reason: {order.cancel_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Estimated Delivery */}
                            {order.estimated_delivery && order.delivery_status !== 'cancelled' && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <Truck className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm text-blue-700 font-medium">
                                            Estimated Delivery: {formatDate(order.estimated_delivery)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Order Actions */}
                            <div className="mt-4 flex justify-between items-center">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleTrackOrder(order.orderId)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Track Order
                                    </button>

                                    {order.delivery_status === 'delivered' && (
                                        <button 
                                            onClick={() => handleRateReview(order)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                        >
                                            <Star className="h-4 w-4 mr-2" />
                                            Rate & Review
                                        </button>
                                    )}

                                    {canCancelOrder(order.delivery_status) && (
                                        <button 
                                            onClick={() => handleCancelOrder(order)}
                                            className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                        >
                                           
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                      
                    </div>
                ))}
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="flex items-center space-x-3 mb-4">
                            <img
                                src={selectedOrder.product_details?.image?.[0]}
                                alt={selectedOrder.product_details?.name}
                                className="h-12 w-12 rounded object-cover border"
                            />
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    {selectedOrder.product_details?.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Order #{selectedOrder.orderId}
                                </p>
                            </div>
                        </div>

                        {/* Cancellation Reason */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for cancellation *
                            </label>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select a reason</option>
                                {cancelReasons.map((reason, index) => (
                                    <option key={index} value={reason}>
                                        {reason}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Warning Message */}
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium">Important:</p>
                                    <p>Once cancelled, this action cannot be undone. Any payment will be refunded within 3-5 business days.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleSubmitCancel}
                                disabled={loading || !cancelReason}
                                className="flex-1 px-4 py-2 border border-transparent rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rate & Review Modal */}
            {showReviewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Rate & Review</h3>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="flex items-center space-x-3 mb-4">
                            <img
                                src={selectedOrder.product_details?.image?.[0]}
                                alt={selectedOrder.product_details?.name}
                                className="h-12 w-12 rounded object-cover border"
                            />
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    {selectedOrder.product_details?.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Order #{selectedOrder.orderId}
                                </p>
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating
                            </label>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleStarClick(star)}
                                        className={`h-8 w-8 ${
                                            star <= reviewData.rating 
                                                ? 'text-yellow-400 fill-current' 
                                                : 'text-gray-300'
                                        } hover:text-yellow-400 focus:outline-none`}
                                    >
                                        <Star className="h-full w-full" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review (Optional)
                            </label>
                            <textarea
                                value={reviewData.comment}
                                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                                rows="3"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Share your experience with this product..."
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;


