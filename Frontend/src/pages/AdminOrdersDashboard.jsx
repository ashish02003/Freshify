import React, { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Search,
  Filter,
  DollarSign,
  MapPin,
  Phone,
  User,
} from "lucide-react";

const baseURL = "http://localhost:8080";

const AdminOrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
    })}`;
  };

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "N/A" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN"),
      time: date.toLocaleTimeString("en-IN", { hour12: true }),
    };
  };

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${baseURL}/api/order/admin/all-orders?page=${page}&limit=20&status=${statusFilter}&search=${searchTerm}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.data) {
        // Handle both array and object response structures
        if (Array.isArray(data.data)) {
          setOrders(data.data);
          setTotalPages(1);
        } else if (data.data.orders && Array.isArray(data.data.orders)) {
          setOrders(data.data.orders);
          setTotalPages(data.data.pagination?.totalPages || 1);
        } else {
          console.error("Invalid response structure:", data);
          setOrders([]);
          setTotalPages(1);
        }
      } else {
        console.error("Invalid response structure:", data);
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching orders", error);
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, searchTerm]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(
        `${baseURL}/api/order/admin/order/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, delivery_status: newStatus }
              : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={16} />;
      case "processing":
        return <Package size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "delivered":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Helper function to get the total amount from various possible field names
  const getTotalAmount = (order) => {
    return (
      order.totalAmount ||
      order.totalAmt ||
      order.amount ||
      order.totalPrice ||
      order.total ||
      0
    );
  };

  // Helper function to format product information
  const getProductInfo = (order) => {
    // Check if product_details exists as an object (not array) - matching your working code
    if (
      order.product_details &&
      typeof order.product_details === "object" &&
      !Array.isArray(order.product_details)
    ) {
      return [
        {
          name:
            order.product_details.name ||
            order.product_details.productName ||
            order.product_details.title ||
            "Unknown Product",
          quantity:
            order.product_details.quantity || order.product_details.qty || 1,
          price:
            order.product_details.price || order.product_details.amount || 0,
        },
      ];
    }

    // Check if product_details is an array
    if (order.product_details && Array.isArray(order.product_details)) {
      return order.product_details.map((product) => ({
        name:
          product.name ||
          product.productName ||
          product.title ||
          "Unknown Product",
        quantity: product.quantity || product.qty || 1,
        price: product.price || product.amount || 0,
      }));
    }

    // Check other possible array structures
    if (order.products && Array.isArray(order.products)) {
      return order.products.map((product) => ({
        name:
          product.name ||
          product.productName ||
          product.title ||
          "Unknown Product",
        quantity: product.quantity || product.qty || 1,
        price: product.price || product.amount || 0,
      }));
    }

    if (order.items && Array.isArray(order.items)) {
      return order.items.map((item) => ({
        name: item.name || item.productName || item.title || "Unknown Product",
        quantity: item.quantity || item.qty || 1,
        price: item.price || item.amount || 0,
      }));
    }

    return [];
  };

  // Updated renderProductSummary to show full names without truncation
  const renderProductSummary = (products) => {
    if (!products || products.length === 0) {
      return (
        <div className="flex items-center text-gray-500 text-sm">
          <Package size={14} className="mr-1" />
          <span>No products</span>
        </div>
      );
    }

    const firstProduct = products[0];

    if (products.length === 1) {
      return (
        <div className="text-sm">
          <div
            className="font-medium text-gray-900 leading-tight"
            title={firstProduct.name}
          >
            {firstProduct.name}
          </div>
          {firstProduct.quantity > 1 && (
            <div className="text-gray-500 mt-1">
              Qty: {firstProduct.quantity}
            </div>
          )}
        </div>
      );
    } else {
      const totalItems = products.reduce(
        (sum, product) => sum + (product.quantity || 1),
        0
      );
      return (
        <div className="text-sm">
          <div
            className="font-medium text-gray-900 leading-tight mb-1"
            title={firstProduct.name}
          >
            {firstProduct.name}
          </div>
          <div className="text-gray-500">
            +{products.length - 1} more ({totalItems} total)
          </div>
          {/* Show all product names in a compact format */}
          <div className="mt-1 text-xs text-gray-400">
            {products.slice(1).map((product, index) => (
              <div key={index} className="leading-tight">
                {product.name} (Qty: {product.quantity})
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Orders Management
        </h1>

        {/* Filters - Responsive */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Display - Responsive */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Package size={64} className="text-gray-400 mb-4" />
              <p className="text-xl font-semibold text-gray-600">
                No orders found
              </p>
              <p className="text-gray-500">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order-ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                        Products
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const products = getProductInfo(order);
                      const totalAmount = getTotalAmount(order);

                      return (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderId}
                              </div>

                              <div className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone
                                size={20}
                                className="mr-1 text-green-600"
                              />
                              {order.delivery_address?.mobile ||
                                order.delivery_address?.phone ||
                                order.userId?.mobile ||
                                order.userId?.phone ||
                                "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-start">
                              <MapPin
                                size={24}
                                className="mr-1 text-red-600 mt-1"
                              />
                              <div className="text-sm text-gray-900">
                                <div>
                                  {order.delivery_address?.address_line ||
                                    "N/A"}
                                </div>
                                <div className="text-gray-500">
                                  {order.delivery_address?.city},{" "}
                                  {order.delivery_address?.state}
                                </div>
                                <div className="text-gray-700">
                                  PIN:{" "}
                                  {order.delivery_address?.pincode || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            className="px-4 py-4"
                            style={{ minWidth: "250px" }}
                          >
                            <div className="flex items-start">
                              <Package
                                size={16}
                                className="text-blue-600 mr-2 mt-1 flex-shrink-0"
                              />
                              <div className="flex-1">
                                {renderProductSummary(products)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-green-700">
                                {formatCurrency(totalAmount)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                order.delivery_status
                              )}`}
                            >
                              {getStatusIcon(order.delivery_status)}
                              <span className="ml-1 capitalize">
                                {order.delivery_status || "pending"}
                              </span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {orders.map((order) => {
                  const products = getProductInfo(order);
                  const totalAmount = getTotalAmount(order);

                  return (
                    <div
                      key={order._id}
                      className="border-b border-gray-200 p-4 hover:bg-gray-50"
                    >
                      {/* Header with Status and Amount */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              order.delivery_status
                            )}`}
                          >
                            {getStatusIcon(order.delivery_status)}
                            <span className="ml-1 capitalize">
                              {order.delivery_status || "pending"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center ml-3">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(totalAmount)}
                          </span>
                        </div>
                      </div>
                      <div className="mb-1 text-sm text-pink-700 font-mono">
                        <span className="font-semibold text-gray-800 ">
                          Order ID:
                        </span>{" "}
                        {order.orderId || order._id?.slice(-6) || "N/A"}
                      </div>

                      {/* Booking Date & Time */}
                      <div className="mb-2 text-xs text-gray-500">
                        <span className="font-medium text-green-700">
                          Booked On :
                        </span>{" "}
                        {new Date(order.createdAt).toLocaleDateString()}{" "}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {/* Contact Info */}
                      <div className="mb-3">
                        <div className="flex items-center text-sm text-gray-900 mb-1">
                          <Phone size={20} className="mr-2 text-pink-600" />

                          <span className="font-medium">Contact:</span>
                          <span className="ml-1">
                            {order.delivery_address?.mobile ||
                              order.delivery_address?.phone ||
                              order.userId?.mobile ||
                              order.userId?.phone ||
                              "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="mb-3">
                        <div className="flex items-start">
                          <MapPin
                            size={22}
                            className="mr-2 text-red-500 mt-1 flex-shrink-0"
                          />
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">Address:</div>
                            <div className="mt-1">
                              <div>
                                {order.delivery_address?.address_line || "N/A"}
                              </div>
                              <div className="text-gray-500">
                                {order.delivery_address?.city},{" "}
                                {order.delivery_address?.state}
                              </div>
                              <div className="text-gray-700">
                                PIN: {order.delivery_address?.pincode || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="mb-4">
                        <div className="flex items-start">
                          <Package
                            size={22}
                            className="text-blue-600 mr-2 mt-1 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 mb-1">
                              Products:
                            </div>
                            {renderProductSummary(products)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal - Responsive */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600 sm:hidden"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    Customer Information
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedOrder.delivery_address?.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedOrder.delivery_address?.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedOrder.delivery_address?.mobile ||
                        selectedOrder.delivery_address?.phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    Delivery Address
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{selectedOrder.delivery_address?.address_line}</p>
                    <p>
                      {selectedOrder.delivery_address?.city},{" "}
                      {selectedOrder.delivery_address?.state}
                    </p>
                    <p>
                      {selectedOrder.delivery_address?.country} -{" "}
                      {selectedOrder.delivery_address?.pincode}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    Order Information
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Total Amount:</span>{" "}
                      {formatCurrency(getTotalAmount(selectedOrder))}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {selectedOrder.delivery_status}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {formatDateTime(selectedOrder.createdAt).date}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {formatDateTime(selectedOrder.createdAt).time}
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <h4 className="font-medium text-gray-900">Product Details</h4>
                  {getProductInfo(selectedOrder).length > 0 ? (
                    <div className="space-y-2">
                      {getProductInfo(selectedOrder).map((product, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900 text-sm">
                            {product.name}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-600">
                              Quantity: {product.quantity}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No product details available
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="w-full px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersDashboard;

// import React, { useState, useEffect } from "react";
// import {
//   Package,
//   Users,
//   ShoppingCart,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Truck,
//   Eye,
//   Search,
//   Filter,
//   Calendar,
//   DollarSign,
//   BarChart3,
//   PieChart,
//   MapPin,
//   Phone,
//   Mail,
//   User,
// } from "lucide-react";

// const baseURL = "http://localhost:8080";

// const AdminOrdersDashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showOrderDetails, setShowOrderDetails] = useState(false);

//   // Helper function to format currency
//   const formatCurrency = (amount) => {
//     if (!amount && amount !== 0) return "₹0";
//     return `₹${parseFloat(amount).toLocaleString("en-IN", {
//       minimumFractionDigits: 0,
//     })}`;
//   };

//   // Helper function to format date and time
//   const formatDateTime = (dateString) => {
//     if (!dateString) return { date: "N/A", time: "N/A" };
//     const date = new Date(dateString);
//     return {
//       date: date.toLocaleDateString("en-IN"),
//       time: date.toLocaleTimeString("en-IN", { hour12: true }),
//     };
//   };

//   // Fetch orders from backend
//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${baseURL}/api/order/admin/all-orders?page=${page}&limit=20&status=${statusFilter}&search=${searchTerm}`,
//         { credentials: "include" }
//       );

//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }

//       const data = await res.json();

//       if (data.success && data.data) {
//         // Handle both array and object response structures
//         if (Array.isArray(data.data)) {
//           setOrders(data.data);
//           setTotalPages(1);
//         } else if (data.data.orders && Array.isArray(data.data.orders)) {
//           setOrders(data.data.orders);
//           setTotalPages(data.data.pagination?.totalPages || 1);
//         } else {
//           console.error("Invalid response structure:", data);
//           setOrders([]);
//           setTotalPages(1);
//         }
//       } else {
//         console.error("Invalid response structure:", data);
//         setOrders([]);
//         setTotalPages(1);
//       }
//     } catch (error) {
//       console.error("Error fetching orders", error);
//       setOrders([]);
//       setTotalPages(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, [page, statusFilter, searchTerm]);

//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       const res = await fetch(
//         `${baseURL}/api/order/admin/order/${orderId}/status`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ status: newStatus }),
//           credentials: "include",
//         }
//       );

//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//       const data = await res.json();

//       if (data.success) {
//         setOrders((prev) =>
//           prev.map((order) =>
//             order._id === orderId
//               ? { ...order, delivery_status: newStatus }
//               : order
//           )
//         );
//       }
//     } catch (error) {
//       console.error("Error updating order status:", error);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800 border-yellow-300";
//       case "processing":
//         return "bg-blue-100 text-blue-800 border-blue-300";
//       case "shipped":
//         return "bg-purple-100 text-purple-800 border-purple-300";
//       case "delivered":
//         return "bg-green-100 text-green-800 border-green-300";
//       case "cancelled":
//         return "bg-red-100 text-red-800 border-red-300";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-300";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return <Clock size={16} />;
//       case "processing":
//         return <Package size={16} />;
//       case "shipped":
//         return <Truck size={16} />;
//       case "delivered":
//         return <CheckCircle size={16} />;
//       case "cancelled":
//         return <XCircle size={16} />;
//       default:
//         return <Package size={16} />;
//     }
//   };

//   const showOrderDetailsModal = (order) => {
//     setSelectedOrder(order);
//     setShowOrderDetails(true);
//   };

//   // Helper function to get the total amount from various possible field names
//   const getTotalAmount = (order) => {
//     return (
//       order.totalAmount ||
//       order.totalAmt ||
//       order.amount ||
//       order.totalPrice ||
//       order.total ||
//       0
//     );
//   };

//   // Helper function to format product information
//   const getProductInfo = (order) => {
//     // Check if product_details exists as an object (not array) - matching your working code
//     if (
//       order.product_details &&
//       typeof order.product_details === "object" &&
//       !Array.isArray(order.product_details)
//     ) {
//       return [
//         {
//           name:
//             order.product_details.name ||
//             order.product_details.productName ||
//             order.product_details.title ||
//             "Unknown Product",
//           quantity:
//             order.product_details.quantity || order.product_details.qty || 1,
//           price:
//             order.product_details.price || order.product_details.amount || 0,
//         },
//       ];
//     }

//     // Check if product_details is an array
//     if (order.product_details && Array.isArray(order.product_details)) {
//       return order.product_details.map((product) => ({
//         name:
//           product.name ||
//           product.productName ||
//           product.title ||
//           "Unknown Product",
//         quantity: product.quantity || product.qty || 1,
//         price: product.price || product.amount || 0,
//       }));
//     }

//     // Check other possible array structures
//     if (order.products && Array.isArray(order.products)) {
//       return order.products.map((product) => ({
//         name:
//           product.name ||
//           product.productName ||
//           product.title ||
//           "Unknown Product",
//         quantity: product.quantity || product.qty || 1,
//         price: product.price || product.amount || 0,
//       }));
//     }

//     if (order.items && Array.isArray(order.items)) {
//       return order.items.map((item) => ({
//         name: item.name || item.productName || item.title || "Unknown Product",
//         quantity: item.quantity || item.qty || 1,
//         price: item.price || item.amount || 0,
//       }));
//     }

//     return [];
//   };

//   const renderProductSummary = (products) => {
//     if (!products || products.length === 0) {
//       return (
//         <div className="flex items-center text-gray-500 text-sm">
//           <Package size={14} className="mr-1" />
//           <span>No products</span>
//         </div>
//       );
//     }

//     const firstProduct = products[0];

//     if (products.length === 1) {
//       return (
//         <div className="text-sm">
//           <div
//             className="font-medium text-gray-900 truncate max-w-32"
//             title={firstProduct.name}
//           >
//             {firstProduct.name}
//           </div>
//           {firstProduct.quantity > 1 && (
//             <div className="text-gray-500">Qty: {firstProduct.quantity}</div>
//           )}
//         </div>
//       );
//     } else {
//       const totalItems = products.reduce(
//         (sum, product) => sum + (product.quantity || 1),
//         0
//       );
//       return (
//         <div className="text-sm">
//           <div
//             className="font-medium text-gray-900 truncate max-w-32"
//             title={firstProduct.name}
//           >
//             {firstProduct.name}
//           </div>
//           <div className="text-gray-500">
//             +{products.length - 1} more ({totalItems} total)
//           </div>
//         </div>
//       );
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen pt-20">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">
//           Orders Management
//         </h1>

//         {/* Filters */}
//         <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
//           <div className="flex flex-wrap items-center gap-4">
//             <div className="flex items-center gap-2">
//               <Search size={18} className="text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by Order ID, Customer name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="border border-gray-300 p-2 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <Filter size={18} className="text-gray-400" />
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="processing">Processing</option>
//                 <option value="shipped">Shipped</option>
//                 <option value="delivered">Delivered</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Orders Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
//             </div>
//           ) : orders.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-64">
//               <Package size={64} className="text-gray-400 mb-4" />
//               <p className="text-xl font-semibold text-gray-600">
//                 No orders found
//               </p>
//               <p className="text-gray-500">
//                 Try adjusting your filters or search terms
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Order
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Customer
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Contact
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Address
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Products
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Amount
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {orders.map((order) => {
//                     const products = getProductInfo(order);
//                     const totalAmount = getTotalAmount(order);

//                     return (
//                       <tr key={order._id} className="hover:bg-gray-50">
//                         <td className="px-4 py-4">
//                           <div>
//                             <div className="text-sm font-medium text-gray-900">
//                               {order.orderId}
//                             </div>

//                             <div className="text-sm text-gray-500">
//                               {new Date(order.createdAt).toLocaleString()}
//                             </div>

//                           </div>

//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="flex items-center">
//                             <User size={20} className="text-gray-400 mr-2" />
//                             <div>
//                               <div className="text-sm font-medium text-gray-900">
//                                 {order.delivery_address?.name ||
//                                   order.userId?.name ||
//                                   "N/A"}
//                               </div>
//                               <div className="text-sm text-gray-500 flex items-center">
//                                 <Mail size={12} className="mr-1" />
//                                 {order.delivery_address?.email ||
//                                   order.userId?.email ||
//                                   "N/A"}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="flex items-center text-sm text-gray-900">
//                             <Phone size={12} className="mr-1 text-gray-400" />
//                             {order.delivery_address?.mobile ||
//                               order.delivery_address?.phone ||
//                               order.userId?.mobile ||
//                               order.userId?.phone ||
//                               "N/A"}
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="flex items-start">
//                             <MapPin
//                               size={12}
//                               className="mr-1 text-gray-400 mt-1"
//                             />
//                             <div className="text-sm text-gray-900">
//                               <div>
//                                 {order.delivery_address?.address_line || "N/A"}
//                               </div>
//                               <div className="text-gray-500">
//                                 {order.delivery_address?.city},{" "}
//                                 {order.delivery_address?.state}
//                               </div>
//                               <div className="text-gray-500">
//                                 PIN: {order.delivery_address?.pincode || "N/A"}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="flex items-start">
//                             <Package
//                               size={16}
//                               className="text-blue-600 mr-2 mt-1"
//                             />
//                             {renderProductSummary(products)}
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="flex items-center">
//                             <DollarSign size={12} className="text-green-600" />
//                             <span className="text-sm font-medium text-gray-900">
//                               {formatCurrency(totalAmount)}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <span
//                             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
//                               order.delivery_status
//                             )}`}
//                           >
//                             {getStatusIcon(order.delivery_status)}
//                             <span className="ml-1 capitalize">
//                               {order.delivery_status || "pending"}
//                             </span>
//                           </span>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="flex items-center space-x-2">
//                             <select
//                               value={order.delivery_status || "pending"}
//                               onChange={(e) =>
//                                 updateOrderStatus(order._id, e.target.value)
//                               }
//                               className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             >
//                               <option value="pending">Pending</option>
//                               <option value="processing">Processing</option>
//                               <option value="shipped">Shipped</option>
//                               <option value="delivered">Delivered</option>
//                               <option value="cancelled">Cancelled</option>
//                             </select>
//                             <button
//                               onClick={() => showOrderDetailsModal(order)}
//                               className="text-blue-600 hover:text-blue-900"
//                             >
//                               <Eye size={16} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg mt-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>
//                 <span className="text-sm text-gray-700">
//                   Page <span className="font-medium">{page}</span> of{" "}
//                   <span className="font-medium">{totalPages}</span>
//                 </span>
//                 <button
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Order Details Modal */}
//       {showOrderDetails && selectedOrder && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//           <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
//             <div className="mt-3">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">
//                 Order Details - {selectedOrder.orderId}
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <h4 className="font-medium text-gray-900">
//                     Customer Information
//                   </h4>
//                   <p className="text-sm text-gray-600">
//                     Name: {selectedOrder.delivery_address?.name}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Email: {selectedOrder.delivery_address?.email}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Phone:{" "}
//                     {selectedOrder.delivery_address?.mobile ||
//                       selectedOrder.delivery_address?.phone}
//                   </p>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900">
//                     Delivery Address
//                   </h4>
//                   <p className="text-sm text-gray-600">
//                     {selectedOrder.delivery_address?.address_line}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     {selectedOrder.delivery_address?.city},{" "}
//                     {selectedOrder.delivery_address?.state}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     {selectedOrder.delivery_address?.country} -{" "}
//                     {selectedOrder.delivery_address?.pincode}
//                   </p>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900">
//                     Order Information
//                   </h4>
//                   <p className="text-sm text-gray-600">
//                     Total Amount:{" "}
//                     {formatCurrency(getTotalAmount(selectedOrder))}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Status: {selectedOrder.delivery_status}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Booking Date: {formatDateTime(selectedOrder.createdAt).date}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Booking Time: {formatDateTime(selectedOrder.createdAt).time}
//                   </p>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900">Product Details</h4>
//                   {getProductInfo(selectedOrder).length > 0 ? (
//                     getProductInfo(selectedOrder).map((product, index) => (
//                       <div key={index} className="text-sm text-gray-600 mb-2">
//                         <p className="font-medium">{product.name}</p>
//                         <p>Quantity: {product.quantity}</p>
//                         <p>Price: {formatCurrency(product.price)}</p>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-sm text-gray-600">
//                       No product details available
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="items-center px-4 py-3 text-right">
//                 <button
//                   onClick={() => setShowOrderDetails(false)}
//                   className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminOrdersDashboard;
