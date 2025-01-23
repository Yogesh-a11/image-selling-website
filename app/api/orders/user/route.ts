import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({error: "unauthorized"}, {status: 401});
        }
        
        await connectDB();

        const orders = await Order.find({userId: session.user.id})
        .populate({
            path: "productId",
            select: "name imageUrl",
            options: {strictPopulate: false}
        })
        .sort({createdAt: -1})
        .lean();

        return NextResponse.json({orders}, {status: 200});

    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "something went wrong"}, {status: 500});
    }
}