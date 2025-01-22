import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {
        const {email, password} = await request.json()
        if (!email || !password) {
            return NextResponse.json(
                {error: "Email and password are rquired"},
                {status: 400}
            )
        }

        await connectDB()
        const existingUser = await UserModel.findOne({email})
        if (existingUser) {
            return NextResponse.json(
                {error: "Email already exist"},
                {status: 400}
            )
        }
        await UserModel.create({
            email,
            password,
            role: "user"
        })

        return NextResponse.json(
            {message: "User registered successfully"},
            {status: 201}
        )
    } catch (error) {
        console.error("Registeration error", error)
        return NextResponse.json(
            {error: "failed to register user"},
            {status: 500}
        )
    }
}