import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({}).lean();

        if (!products || products.length === 0) {
            return NextResponse.json({ error: "no products founs"}, {status: 404});
        }

        return NextResponse.json({products}, {status: 200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: "something went wrong"}, {status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if(!session || session.user?.role !== "admin") {
            return NextResponse.json({error: "unauthorized"}, {status: 401});
        }
        await connectDB();

        const body: IProduct = await request.json();

        if (
            !body.name || 
            !body.description || 
            !body.imageUrl || 
            body.variants.length === 0 ) {
            return NextResponse.json({error: "All fields are required"}, {status: 400})
        }

        const newProduct = await Product.create(body);
        return NextResponse.json({newProduct}, {status: 201});
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {error: "something went wrong "},
            {status: 500}
        )
    }
}