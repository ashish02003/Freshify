import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

// const baseURL = 'http://localhost:8080'; //for local 

const baseURL = import.meta.env.VITE_API_URL || 'https://freshify-omega.vercel.app';

const OrderTracking = ({ orderId }) => {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const statusSteps = [
        { key: 'pending', label: 'Order Placed', icon: Package },
        { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
        { key: 'processing', label: 'Processing', icon: Clock },
        { key: 'packed', label: 'Packed', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    useEffect(() => {
        if (orderId) {
            fetchTrackingData();
        }
    }, [orderId]);

    const fetchTrackingData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${baseURL}/api/order/track/${orderId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                setTrackingData(result.data);
            } else {
                setError(result.message || 'Failed to fetch tracking data');
            }
        } catch (error) {
            setError('Failed to fetch tracking data');
            console.error('Error fetching tracking data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStepIndex = () => {
        if (!trackingData) return -1;
        return statusSteps.findIndex(step => step.key === trackingData.delivery_status);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                    <button
                        onClick={fetchTrackingData}
                        className="mt-2 text-red-600 underline text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!trackingData) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">No tracking data available</p>
                </div>
            </div>
        );
    }

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm border">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Track Order: {trackingData.orderId}
                            </h2>
                            {trackingData.tracking_number && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Tracking Number: {trackingData.tracking_number}
                                </p>
                            )}
                        </div>
                        {trackingData.estimated_delivery && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Estimated Delivery</p>
                                <p className="font-medium text-gray-900">
                                    {formatDate(trackingData.estimated_delivery)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delivery Partner Info */}
                {trackingData.delivery_partner && (
                    <div className="px-6 py-4 bg-blue-50 border-b">
                        <div className="flex items-center space-x-3">
                            <Truck className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-blue-900">
                                    Delivery Partner: {trackingData.delivery_partner.name}
                                </p>
                                <p className="text-sm text-blue-700">
                                    Phone: {trackingData.delivery_partner.phone} | 
                                    Vehicle: {trackingData.delivery_partner.vehicle_number}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="px-6 py-6">
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200"></div>
                        <div 
                            className="absolute left-8 top-0 w-0.5 bg-green-500 transition-all duration-500"
                            style={{ 
                                height: currentStepIndex >= 0 ? `${((currentStepIndex + 1) / statusSteps.length) * 100}%` : '0%' 
                            }}
                        ></div>

                        {/* Steps */}
                        <div className="space-y-6">
                            {statusSteps.map((step, index) => {
                                const Icon = step.icon;
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step.key} className="relative flex items-center">
                                        {/* Icon */}
                                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                            isCompleted 
                                                ? 'bg-green-500 border-green-500 text-white' 
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className={`font-medium ${
                                                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && trackingData.delivery_status === step.key && (
                                                        <p className="text-sm text-blue-600 font-medium">
                                                            Current Status
                                                        </p>
                                                    )}
                                                </div>
                                                

                                                
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tracking Updates */}
                {trackingData.tracking_updates && trackingData.tracking_updates.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-4">Tracking Updates</h3>
                        <div className="space-y-3">
                            {trackingData.tracking_updates
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .map((update, index) => (
                                <div key={index} className="flex items-start space-x-3 py-2">
                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {update.message}
                                                </p>
                                                {update.location && (
                                                    <p className="text-sm text-gray-600 flex items-center mt-1">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {update.location}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                {formatDate(update.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Delivery Address */}
                {trackingData.delivery_address && (
                    <div className="px-6 py-4 bg-gray-50 border-t">
                        <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                        <div className="text-sm text-gray-700">
                            <p>{trackingData.delivery_address.address_line}</p>
                            <p>{trackingData.delivery_address.city}, {trackingData.delivery_address.state}</p>
                            <p>{trackingData.delivery_address.country} - {trackingData.delivery_address.pincode}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center space-x-4">
                <button
                    onClick={fetchTrackingData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh Tracking
                </button>
                {trackingData.delivery_status === 'delivered' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Rate Order
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;