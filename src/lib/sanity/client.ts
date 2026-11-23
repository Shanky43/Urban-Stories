import {createClient} from "next-sanity";
const projectId=process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,dataset=process.env.NEXT_PUBLIC_SANITY_DATASET;
export const sanityConfigured=Boolean(projectId&&dataset);
export const sanityClient=createClient({projectId:projectId||"missing-project",dataset:dataset||"production",apiVersion:process.env.NEXT_PUBLIC_SANITY_API_VERSION||"2026-11-23",useCdn:process.env.NODE_ENV==="production",perspective:"published"});
export async function sanityFetch<T>({query,params={},tags=[]}:{query:string;params?:Record<string,unknown>;tags?:string[]}):Promise<T|null>{if(!sanityConfigured)return null;try{return await sanityClient.fetch<T>(query,params,{next:{revalidate:60,tags:["sanity",...tags]}})}catch(error){console.error("Sanity fetch failed",error);return null}}
