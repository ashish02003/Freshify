import UserModel from "../Models/UserModel.js";

const adminAuth = async (request, response, next) => {
    try {
        const userId = request.userId; // This comes from your auth middleware

        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(401).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // Check if user is admin (you need to add role field to your User model)
        if (user.role !== 'ADMIN') {
            return response.status(403).json({
                message: "Access denied. Admin privileges required.",
                error: true,
                success: false
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Admin authentication failed",
            error: true,
            success: false
        });
    }
};

export default adminAuth;