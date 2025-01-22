import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    props: {params: Promise<{id: string}>}
) {
    try {
        const { id }=await props.params;
        await connectDB;
        const product = await Product.findById(id).lean();

        if (!product) {
            return NextResponse.json({error: "Product not found"}, {status: 404});
        }

        return NextResponse.json({product}, {status: 200});

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {error: "failed to fetch product"}, 
            {status: 500}

        );
    }
}