import crypto from "crypto";
import razorpay from "../services/razorpay.js";
import Payment from "../models/paymentMode.js";
import User from "../models/userModel.js";

// Create Razorpay Order
export const createPayment = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body;
        if (!amount || !credits) {
            return res.status(400).json({ message: "Invalid plan data" })
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        const payment = await Payment.create({
            userId: req.userId,
            planId,
            amount,
            credits,
            razorpayOrderId: order.id,
            status: "created",
        });

        return res.status(200).json({
            success: true,
            order,
            payment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        const isAuthentic = expectedSign === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }
        if(payment.status === "paid"){
            return res.json({message:"Already processed."})
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = "paid";
        await payment.save();

        // Add credits to user
        const updatedUser = await User.findByIdAndUpdate(
            payment.userId,
            {
                $inc: {
                    credits: payment.credits,
                },
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Payment successful",
            user:updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};