import { validateCommunityBenchmark, isLikelyOutlier, median } from "../src/features/benchmarks/community";
const base={consent:true,gpu:"RX Test",cpu:"CPU",ramGb:32,os:"linux" as const,distro:"CachyOS",model:"Model",quantization:"Q4",contextK:8,runtime:"Ollama",backend:"ROCm",generationTps:40,promptTps:150,vramGb:12,measured:true as const};
const good=validateCommunityBenchmark(base);
const noConsent=validateCommunityBenchmark({...base,consent:false});
const crazy=validateCommunityBenchmark({...base,generationTps:999999});
const unmeasured=validateCommunityBenchmark({...base,measured:false});
const sanitized=validateCommunityBenchmark({...base,gpu:"RX\u0000 Test"});
const tests:[string,boolean][]=[
 ["valid accepted",good.ok],
 ["consent required",!noConsent.ok],
 ["range guard",!crazy.ok],
 ["measured only",!unmeasured.ok],
 ["control chars stripped",sanitized.ok&&sanitized.value.gpu==="RX Test"],
 ["median",median([1,2,3,4,5])===3],
 ["normal not outlier",!isLikelyOutlier(40,[38,39,40,41,42,40,39])],
 ["extreme outlier",isLikelyOutlier(200,[38,39,40,41,42,40,39])],
];let failed=false;for(const[n,p]of tests){console.log(`${p?"PASS":"FAIL"} ${n}`);if(!p)failed=true}if(failed)throw new Error("stage21 failed");
