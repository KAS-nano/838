import Link from "next/link";
const cards=[
 ["Modelos de IA","LLMs e VLMs com variantes, contexto e requisitos.","/modelos"],
 ["Recomendações","Ranking considerando hardware, tarefa e preferência.","/recomendacoes"],
 ["Comparador","Compare memória, armazenamento, compatibilidade e desempenho.","/comparar"],
 ["Ferramentas","Runtimes, IDEs, vídeo, imagem, áudio e APIs.","/ferramentas"],
 ["Central de Instalação","Receitas adaptadas ao seu sistema operacional.","/instalar"],
 ["Benchmark local","Meça tokens/s no Ollama com execução voluntária.","/benchmark"],
];
export default function Explore(){return <main><div className="page-container"><p className="text-xs uppercase tracking-[.24em] text-accent">838 / Explorar</p><h1 className="page-title">Explore o ecossistema</h1><p className="mt-3 max-w-2xl text-muted">Você pode navegar sem cadastrar hardware. Para recomendações personalizadas, conclua a análise do sistema.</p><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(([title,text,href])=><Link href={href} key={href} className="panel p-6 transition hover:border-accent/30 hover:bg-accent/[.04]"><h2 className="text-xl font-medium">{title}</h2><p className="mt-3 text-sm leading-6 text-muted">{text}</p><span className="mt-7 inline-block text-sm text-accent">Abrir →</span></Link>)}</div></div></main>}
