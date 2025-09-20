import React from 'react';
import OrderTracking from '../components/OrderTracking';

const OrderTrackingPage = () => {
    // Get orderId from URL path
    const orderId = window.location.pathname.split('/track/')[1];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto">
                <OrderTracking orderId={orderId} />
            </div>
        </div>
    );
};

export default OrderTrackingPage;