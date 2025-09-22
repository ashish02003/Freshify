
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
          
            toast.success("Thank you!!🤗 for reviewing us. Your Review submitted successfully!", {
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
    <div className="max-w-6xl mx-auto min-h-screen bg-gray-50 sm:bg-white">
        <div className='bg-white shadow-md p-3 sm:p-4 font-semibold border-b'>
            <h1 className="text-lg sm:text-xl text-gray-900">My Orders</h1>
            <p className="text-xs sm:text-sm text-gray-600 font-normal mt-1">Track and manage your orders</p>
        </div>

        <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            {activeOrders.map((order, index) => (
                <div key={order._id + index + "order"} className='bg-white rounded-lg shadow-lg sm:shadow-lg border overflow-hidden'>
                    {/* Order Header - Mobile Responsive */}
                    <div className="px-3 sm:px-4 py-3 border-b bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                    OrderID: {order?.orderId}
                                </h3>
                                {order.createdAt && (
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Placed on {formatDate(order.createdAt)}
                                    </p>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    statusColors[order.delivery_status] || statusColors.pending
                                }`}>
                                    {getStatusIcon(order.delivery_status)}
                                    <span className="ml-1 hidden sm:inline">
                                        {order.delivery_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                                    </span>
                                    <span className="ml-1 sm:hidden">
                                        {(order.delivery_status?.replace('_', ' ') || 'pending').toUpperCase().slice(0, 5)}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Content - Mobile Stack */}
                    <div className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            {/* Product Image */}
                            {order.product_details?.image?.[0] && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={order.product_details.image[0]}
                                        alt={order.product_details?.name}
                                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover border"
                                    />
                                </div>
                            )}

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2 line-clamp-2">
                                    {order.product_details?.name || 'Product Name'}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div className="flex justify-between sm:block">
                                        <span className="text-gray-600">Amount: </span>
                                        <span className="font-medium text-gray-900">₹{order.totalAmt}</span>
                                    </div>
                                    <div className="flex justify-between sm:block">
                                        <span className="text-gray-600">Payment: </span>
                                        <span className="font-medium text-slate-900">{order.payment_status}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Amount - Responsive Position */}
                            <div className="text-right sm:text-right">
                                <p className="text-base sm:text-lg font-semibold text-green-700">
                                    ₹{order.totalAmt}
                                </p>
                            </div>
                        </div>

                        {/* Delivery Address - Responsive Text */}
                        {order.delivery_address && (
                            <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <MapPin className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                                    <div className="text-xs sm:text-sm text-gray-600 min-w-0">
                                        <p className="font-medium text-gray-700 mb-1">Delivery Address:</p>
                                        <p className="break-words">{order.delivery_address.address_line}</p>
                                        <p className="break-words">{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cancellation Reason - Responsive */}
                        {order.delivery_status === 'cancelled' && order.cancel_reason && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                                    <div className="text-xs sm:text-sm min-w-0">
                                        <p className="font-medium text-red-700 mb-1">Order Cancelled</p>
                                        <p className="text-red-600 break-words">Reason: {order.cancel_reason}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estimated Delivery - Responsive */}
                        {order.estimated_delivery && order.delivery_status !== 'cancelled' && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-start sm:items-center space-x-2">
                                    <Truck className="h-4 w-4 text-blue-600 mt-1 sm:mt-0 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-blue-700 font-medium break-words">
                                        Estimated Delivery: {formatDate(order.estimated_delivery)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Order Actions - Mobile Stack */}
                        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                                <button
                                    onClick={() => handleTrackOrder(order.orderId)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Track Order
                                </button>

                                {order.delivery_status === 'delivered' && (
                                    <button 
                                        onClick={() => handleRateReview(order)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        <Star className="h-4 w-4 mr-2" />
                                        Rate & Review
                                    </button>
                                )}

                                {canCancelOrder(order.delivery_status) && (
                                    <button 
                                        onClick={() => handleCancelOrder(order)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-red-300 shadow-sm text-xs sm:text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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

        {/* Cancel Order Modal - Responsive */}
        {showCancelModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Cancel Order</h3>
                        <button
                            onClick={() => setShowCancelModal(false)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Product Info - Mobile Optimized */}
                    <div className="flex items-center space-x-3 mb-4">
                        <img
                            src={selectedOrder.product_details?.image?.[0]}
                            alt={selectedOrder.product_details?.name}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover border flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">
                                {selectedOrder.product_details?.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                Order #{selectedOrder.orderId}
                            </p>
                        </div>
                    </div>

                    {/* Cancellation Reason */}
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for cancellation *
                        </label>
                        <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

                    {/* Warning Message - Responsive */}
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs sm:text-sm text-yellow-800 min-w-0">
                                <p className="font-medium">Important:</p>
                                <p>Once cancelled, this action cannot be undone. Any payment will be refunded within 3-5 business days.</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Mobile Stack */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                            onClick={() => setShowCancelModal(false)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            Keep Order
                        </button>
                        <button
                            onClick={handleSubmitCancel}
                            disabled={loading || !cancelReason}
                            className="w-full px-4 py-2 border border-transparent rounded-lg text-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Rate & Review Modal - Responsive */}
        {showReviewModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Rate & Review</h3>
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Product Info - Mobile Optimized */}
                    <div className="flex items-center space-x-3 mb-4">
                        <img
                            src={selectedOrder.product_details?.image?.[0]}
                            alt={selectedOrder.product_details?.name}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover border flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">
                                {selectedOrder.product_details?.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                OrderId: {selectedOrder.orderId}
                            </p>
                        </div>
                    </div>

                    {/* Star Rating - Same */}
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

                    {/* Comment - Same */}
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review (Optional)
                        </label>
                        <textarea
                            value={reviewData.comment}
                            onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                            rows="3"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Share your experience with this product..."
                        />
                    </div>

                    {/* Action Buttons - Mobile Stack */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitReview}
                            disabled={loading}
                            className="w-full px-4 py-2 border border-transparent rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
    }

export default MyOrders;


