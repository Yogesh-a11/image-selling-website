import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import nodemailer from "nodemailer";
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(body)
        .digest("hex");

        if (signature !== expectedSignature) {
            return new NextResponse("Invalid signature", { status: 400 });
        }

        const event = JSON.parse(body);
        await connectDB();

        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;

            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: payment.order_id },
                {
                    razorpayPaymentId: payment.id,
                    status: "completed",
                    
                }
            ).populate([
                {path : "productId", select: "name"},
                {path : "userId", select: "email"}
            ])

            if (order) {
                const trasporter = nodemailer.createTransport({
                    service: "sandbox.smtp.mailtrap.io",
                    port: 2525,
                    auth: {
                        user: process.env.MAILTRAP_USER!,
                        pass: process.env.MAILTRAP_PASS!
                    }
                })
                
                await trasporter.sendMail({
                    from: "your@example.com",
                    to: order.userId.email,
                    subject: "Your order has been placed",
                    html: `
                        <h1>Order placed successfully</h1>
                        <p>Product: ${order.productId.name}</p>
                        <p>Variant: ${order.variant}</p>
                        <p>Amount: ${order.amount}</p>
                    `
                })
            }
        }
        
        return new NextResponse("success", { status: 200 });

    } catch (error) {
        console.log(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}