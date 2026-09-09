import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export function getPrisma(){
  const connectionString=process.env.DATABASE_URL;
  if(!connectionString) throw new Error("DATABASE_URL não configurada.");
  if(globalForPrisma.prisma) return globalForPrisma.prisma;
  const adapter=new PrismaPg({connectionString});
  const client=new PrismaClient({adapter});
  if(process.env.NODE_ENV!=="production") globalForPrisma.prisma=client;
  return client;
}
