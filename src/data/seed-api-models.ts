export type SeedApiModel={id:string;name:string;provider:string;inputUsdPerM:number;outputUsdPerM:number;contextK:number;strengths:string[];source:"demo-seed"};
export const seedApiModels:SeedApiModel[]=[
 {id:"api-fast",name:"API econômica (exemplo)",provider:"Catálogo dinâmico",inputUsdPerM:.2,outputUsdPerM:.8,contextK:128,strengths:["Programação","Escrita","Produtividade"],source:"demo-seed"},
 {id:"api-quality",name:"API qualidade (exemplo)",provider:"Catálogo dinâmico",inputUsdPerM:2,outputUsdPerM:8,contextK:256,strengths:["Programação","Documentos","Criação de ideias"],source:"demo-seed"},
];
