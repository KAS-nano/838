import { NextResponse } from "next/server";
async function disabled(){return NextResponse.json({error:"Autenticação persistente não foi ativada. Configure DATABASE_URL, BETTER_AUTH_SECRET e AUTH_ENABLED=true."},{status:503})}
async function handler(request:Request){
 if(process.env.AUTH_ENABLED!=="true") return disabled();
 const [{createAuth},{toNextJsHandler}]=await Promise.all([import("@/lib/auth"),import("better-auth/next-js")]);
 const auth=createAuth(); const h=toNextJsHandler(auth); return request.method==="POST"?h.POST(request):h.GET(request);
}
export const GET=handler;export const POST=handler;
