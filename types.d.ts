import {Connectioin } from "mongoose";

declare global {
    var mongoose: {
        con: Connectioin | null
        promise: Promise<Connectioin> | null
    };
}

export {};