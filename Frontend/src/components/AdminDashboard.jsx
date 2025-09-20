

import React, { useState, useEffect } from 'react';
import { 
    Package, 
    Users, 
    ShoppingCart, 
    TrendingUp, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Truck,
    Eye,
    Search,
    Filter,
    Calendar,
    DollarSign,
    BarChart3,
    PieChart,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';

const baseURL = 'http://localhost:8080';

// Enhanced toast notification function
const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalProducts: 0
    });
    
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
    const [searchTerm, setSearchTerm] = useState('');
    const [debugMode, setDebugMode] = useState(false);
    const [apiErrors, setApiErrors] = useState([]);
    
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

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'packed', label: 'Packed' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    // Alternative API endpoints to try
    const alternativeEndpoints = {
        statistics: [
            '/api/order/admin/statistics',
            '/api/orders/admin/statistics',
            '/api/admin/order/statistics',
            '/api/order/statistics',
            '/api/admin/statistics'
        ],
        orders: [
            '/api/order/admin/all-orders',
            '/api/orders/admin/all',
            '/api/admin/orders',
            '/api/order/all',
            '/api/orders/list'
        ],
        pendingOrders: [
            '/api/order/admin/pending',
            '/api/orders/admin/pending',
            '/api/admin/orders/pending',
            '/api/order/pending',
            '/api/orders/status/pending'
        ]
    };

    useEffect(() => {
        fetchDashboardData();
    }, [selectedTimeRange]);

    const tryEndpoint = async (endpoints, params = '') => {
        for (const endpoint of endpoints) {
            try {
                const url = `${baseURL}${endpoint}${params}`;
                console.log(`🔍 Trying endpoint: ${url}`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`📡 Response status for ${endpoint}:`, response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`✅ Success for ${endpoint}:`, result);
                    return { success: true, data: result, endpoint };
                } else {
                    const errorText = await response.text();
                    console.log(`❌ Error for ${endpoint}:`, response.status, errorText);
                }
            } catch (error) {
                console.log(`❌ Network error for ${endpoint}:`, error.message);
            }
        }
        return { success: false, endpoint: null };
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setApiErrors([]);
        const errors = [];
        
        try {
            console.log('🚀 Starting dashboard data fetch...');
            
            // Try to fetch statistics from multiple possible endpoints
            console.log('📊 Fetching statistics...');
            const statsResult = await tryEndpoint(alternativeEndpoints.statistics);
            
            if (statsResult.success) {
                const statsData = statsResult.data.success ? statsResult.data.data : statsResult.data;
                
                // Log the exact structure to debug pending orders issue
                console.log('🔍 Raw stats data structure:', JSON.stringify(statsData, null, 2));
                
                // Map common field name variations for pending orders
                const mappedStats = {
                    ...statsData,
                    // Handle different possible field names for pending orders
                    pendingOrders: statsData.pendingOrders || 
                                  statsData.pending_orders || 
                                  statsData.pending || 
                                  statsData.pendingOrdersCount ||
                                  statsData.orders_pending ||
                                  0
                };
                
                setStats(prev => ({ ...prev, ...mappedStats }));
                console.log('✅ Statistics loaded and mapped:', mappedStats);
            } else {
                errors.push('Failed to fetch statistics from all possible endpoints');
                console.error('❌ All statistics endpoints failed');
            }

            // If pending orders is still 0 or undefined, try to fetch it separately
            if (!stats.pendingOrders && alternativeEndpoints.pendingOrders) {
                console.log('🔍 Attempting to fetch pending orders separately...');
                const pendingResult = await tryEndpoint(alternativeEndpoints.pendingOrders);
                
                if (pendingResult.success) {
                    const pendingData = pendingResult.data.success ? pendingResult.data.data : pendingResult.data;
                    const pendingCount = Array.isArray(pendingData) ? pendingData.length : pendingData.count || 0;
                    setStats(prev => ({ ...prev, pendingOrders: pendingCount }));
                    console.log('✅ Pending orders loaded separately:', pendingCount);
                } else {
                    console.log('⚠️ Could not fetch pending orders separately');
                }
            }

            // Try to fetch orders from multiple possible endpoints
            // console.log('📋 Fetching orders...');
            const ordersResult = await tryEndpoint(alternativeEndpoints.orders, '?limit=10');
            
            if (ordersResult.success) {
                const ordersData = ordersResult.data.success ? ordersResult.data.data : ordersResult.data;
                const ordersArray = Array.isArray(ordersData) ? ordersData : [];
                setRecentOrders(ordersArray);
                
                // Calculate pending orders from the orders data as fallback
                if (stats.pendingOrders === 0 || !stats.pendingOrders) {
                    const pendingCount = ordersArray.filter(order => 
                        order.delivery_status === 'pending' || 
                        order.status === 'pending' ||
                        !order.delivery_status
                    ).length;
                    
                    if (pendingCount > 0) {
                        setStats(prev => ({ ...prev, pendingOrders: pendingCount }));
                        // console.log('📊 Calculated pending orders from orders list:', pendingCount);
                    }
                }
                
                console.log('✅ Orders loaded:', ordersData);
            } else {
                errors.push('Failed to fetch orders from all possible endpoints');
                console.error('❌ All orders endpoints failed');
                
                // Try a basic orders endpoint without admin prefix
                try {
                    const basicResponse = await fetch(`${baseURL}/api/order/all`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (basicResponse.ok) {
                        const basicResult = await basicResponse.json();
                       
                        if (basicResult.data && Array.isArray(basicResult.data)) {
                            setRecentOrders(basicResult.data.slice(0, 10));
                           
                        }
                    }
                } catch (basicError) {
                    console.error('❌ Basic orders endpoint also failed:', basicError);
                }
            }

            // Check authentication
            // console.log('🔐 Checking authentication...');
            try {
                const authResponse = await fetch(`${baseURL}/api/auth/verify`, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                if (!authResponse.ok) {
                    errors.push('Authentication may have failed');
                    console.warn('⚠️ Auth check failed');
                }
            } catch (authError) {
                console.warn('⚠️ Could not verify authentication');
            }

            if (errors.length > 0) {
                setApiErrors(errors);
                showToast(`${errors.length} API issues detected. Check console for details.`, 'warning');
            }

        } catch (error) {
            const errorMsg = 'Failed to fetch dashboard data';
            errors.push(errorMsg);
            setApiErrors(errors);
            showToast(errorMsg, 'error');
            console.error('💥 Major error in fetchDashboardData:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${baseURL}/api/order/admin/order/${orderId}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    delivery_status: newStatus
                })
            });

            const result = await response.json();

            if (result.success) {
                showToast('Order status updated successfully', 'success');
                fetchDashboardData(); // Refresh data
            } else {
                showToast(result.message || 'Failed to update order status', 'error');
            }
        } catch (error) {
            showToast('Failed to update order status', 'error');
            console.error('Error updating order status:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    // Debug Panel Component
    const DebugPanel = () => (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Debug Information
                </h3>
                <button
                    onClick={() => setDebugMode(!debugMode)}
                    className="text-red-600 hover:text-red-800"
                >
                    {debugMode ? 'Hide' : 'Show'}
                </button>
            </div>
            
            {debugMode && (
                <div className="space-y-3">
                    <div>
                        <h4 className="font-medium text-red-700 mb-2">API Errors:</h4>
                        {apiErrors.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                                {apiErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-green-600">No API errors detected</p>
                        )}
                    </div>
                    
                    <div>
                        <h4 className="font-medium text-red-700 mb-2">Current Data:</h4>
                        <div className="text-xs bg-white p-2 rounded border space-y-2">
                            <div><strong>Pending Orders:</strong> {stats.pendingOrders} (type: {typeof stats.pendingOrders})</div>
                            <div><strong>Total Orders:</strong> {stats.totalOrders}</div>
                            <div><strong>Delivered Orders:</strong> {stats.deliveredOrders}</div>
                            <div><strong>Total Revenue:</strong> {stats.totalRevenue}</div>
                            <pre className="overflow-auto max-h-32 mt-2 text-xs">
                                {JSON.stringify(stats, null, 2)}
                            </pre>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-medium text-red-700 mb-2">Cookies:</h4>
                        <p className="text-xs bg-white p-2 rounded border break-all">
                            {document.cookie || 'No cookies found'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    // Stats Cards Component
    const StatsCard = ({ title, value, icon: Icon, color, change = null }) => (
        <div className={`p-6 rounded-xl border ${color} transition-transform hover:scale-105`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {change && (
                        <p className={`text-xs mt-1 flex items-center ${
                            change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            <TrendingUp className={`h-3 w-3 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
                            {Math.abs(change)}% from last week
                        </p>
                    )}
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Icon className="h-8 w-8 text-gray-600" />
                </div>
            </div>
        </div>
    );

    // Order Status Distribution Component
    const OrderStatusDistribution = () => {
        const total = stats.totalOrders || 1;
        const statusData = [
            { status: 'Pending', count: stats.pendingOrders || 0, color: 'bg-yellow-500' },
            { status: 'Processing', count: stats.processingOrders || 0, color: 'bg-purple-500' },
            { status: 'Shipped', count: stats.shippedOrders || 0, color: 'bg-orange-500' },
            { status: 'Delivered', count: stats.deliveredOrders || 0, color: 'bg-green-500' },
            { status: 'Cancelled', count: stats.cancelledOrders || 0, color: 'bg-red-500' }
        ];

        return (
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Order Status Distribution</h3>
                    <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                    {statusData.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                <span className="text-sm font-medium text-gray-700">{item.status}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">{item.count}</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${item.color}`}
                                        style={{ width: `${Math.min((item.count / total) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-96 bg-gray-200 rounded-xl"></div>
                            <div className="h-96 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Debug Panel - Show when there are issues */}
                {(apiErrors.length > 0 || recentOrders.length === 0) && <DebugPanel />}

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back! Here's your store overview.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                    
                        <button 
                            onClick={fetchDashboardData}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={DollarSign}
                        color="bg-green-50 border-green-200"
                        change={12.5}
                    />
                    <StatsCard
                        title="Total Orders"
                        value={stats.totalOrders || 0}
                        icon={Package}
                        color="bg-blue-50 border-blue-200"
                        change={8.2}
                    />
                    <StatsCard
                        title="Pending Orders"
                        value={stats.pendingOrders || 0}
                        icon={Clock}
                        color="bg-yellow-50 border-yellow-200"
                        change={-3.1}
                    />
                    <StatsCard
                        title="Delivered Orders"
                        value={stats.deliveredOrders || 0}
                        icon={CheckCircle}
                        color="bg-green-50 border-green-200"
                        change={15.3}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Filter className="h-4 w-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Take Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentOrders
                                        .filter(order => 
                                            searchTerm === '' || 
                                            (order.orderId && order.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                            (order.userId?.name && order.userId.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        )
                                        .slice(0, 10)
                                        .map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {order.orderId || order._id?.slice(-6)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-blue-600">
                                                        {order.userId?.name || order.customerName || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-pink-500">
                                                        {order.userId?.email || order.customerEmail || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                                                {formatCurrency(order.totalAmt || order.total || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    statusColors[order.delivery_status] || 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {(order.delivery_status || 'pending').replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={order.delivery_status || 'pending'}
                                                        onChange={(e) => updateOrderStatus(order.orderId || order._id, e.target.value)}
                                                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        {statusOptions.map(status => (
                                                            <option key={status.value} value={status.value}>
                                                                {status.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {recentOrders.length === 0 && (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No orders found</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Orders will appear here once customers make purchases
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Status Distribution */}
                    <OrderStatusDistribution />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button 
                            onClick={() => window.location.href = '/dashboard/orders-management'}
                            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Package className="h-8 w-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Manage Orders</span>
                        </button>
                        <button 
                            onClick={() => window.location.href = '/dashboard/product'}
                            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ShoppingCart className="h-8 w-8 text-green-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Products</span>
                        </button>
                        <button 
                            onClick={() => window.location.href = '/dashboard/category'}
                            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Categories</span>
                        </button>
                        <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Users className="h-8 w-8 text-orange-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Customers</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;