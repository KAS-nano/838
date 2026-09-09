import { NextResponse } from "next/server";
export function GET(){return NextResponse.json({status:"ok",service:"838",version:"1.0.0",timestamp:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}})}
