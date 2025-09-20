import Stripe from "../config/stripe.js";

import cartProductModelCollection from "../Models/CartProductModel.js";
import orderModel from "../Models/OrderModel.js";
import userModelCollection from "../Models/UserModel.js";
import mongoose from "mongoose";

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await orderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await cartProductModelCollection.deleteMany({ userId : userId })
        const updateInUser = await userModelCollection.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 


        // Validate minimum total amount
    if (totalAmt < 50) {
      return response.status(400).json({
        message: "Minimum total amount for online payment is ₹50.",
        error: true,
        success: false,
      });
    }

        const user = await userModelCollection.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.productId._id
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount)*100  
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook 
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
      const order = await orderModel.insertMany(orderProduct)

        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  userModelCollection.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await cartProductModelCollection.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await orderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}



// Cancel order
export async function cancelOrderController(req, res) {
  try {
    const { orderId } = req.params;

    const cancelledOrder = await orderModel.findOneAndUpdate(
      { _id: orderId },
      {
        delivery_status: "cancelled",
        cancelled_reason: req.body?.cancel_reason || "User cancelled order",
        cancelled_by: "customer",
        $push: {
          tracking_updates: {
            status: "cancelled",
            message: "Order cancelled by customer",
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!cancelledOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      message: "Order cancelled successfully",
      success: true,
      data: cancelledOrder,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: error.message });
  }
}

// Update order
export async function updateOrderController(req, res) {
  try {
    const { orderId } = req.params;

    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { ...req.body },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      message: "Order updated successfully",
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: error.message });
  }
}
