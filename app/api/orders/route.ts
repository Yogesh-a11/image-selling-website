import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({error: "unauthorized"}, {status: 401})
        }

        const {productId, variant} = await request.json();
        if (!productId || !variant) {
            return NextResponse.json({error: "All fields are required"}, {status: 400}) 
        }
        await connectDB();

        //create razorpay order 
        const order = await razorpay.orders.create({
            amount: Math.round(variant.price * 100),
            currency: "USD",
            receipt: `recept-${Date.now()}`,
            notes: {
                productId: productId.toString(),
            }
        })
        const newOrder = await Order.create({
            userId: session.user.id,
            productId: productId,
            variant: variant,
            razorpayOrderId: order.id,
            amount: order.amount,
            status: "pending"
        })

        return NextResponse.json(
            {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                dbOrderId: newOrder._id
            }
    )
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "something went wrong"}, {status: 500})
    }
}