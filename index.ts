import Replicate from "replicate";
import { ChromaClient, Collection } from 'chromadb'

const succeeded:{ [key: string]: any } = {};
let run = true;

const chromaclient = new ChromaClient();
const desc_collection = await chromaclient.getCollection({name:"document_descriptions"})
const eric_large_chunks = await chromaclient.getCollection({name:"eric_large_chunks"})
const eric_medium_chunks = await chromaclient.getCollection({name:"eric_medium_chunks"})
const eric_small_chunks = await chromaclient.getCollection({name:"eric_small_chunks"})
const collection_map:{[key: string]: Collection} = {
    "desc" : desc_collection,
    "document" : desc_collection,
    "doc" : desc_collection, 
    "large" : eric_large_chunks,
    "medium" : eric_medium_chunks,
    "small" : eric_small_chunks
};

const server = Bun.serve({
    port: 3000,
    fetch: async (request) => {
        console.log("req!")
       if (request.method === "GET") {
            const url = new URL(request.url);
            console.log(url.search);
            const searchParams = new URLSearchParams(url.search);
            let get_similar = searchParams.get("get_similar");
            if(get_similar != undefined) {    
                let top_k:number = searchParams.get("top_k") == null ? 5 : parseInt(searchParams.get("top_k") as string);
                let granularity:string = searchParams.get("granularity") == null ? "desc" : searchParams.get("granularity") as string;
                let replicateResult = await queryEmbRequest([get_similar]) as any;
                let stringEmb = replicateResult[0];
                let from_collection:Collection = collection_map[granularity];
                let closest_chunks = await from_collection.query(
                    {queryEmbeddings:[stringEmb],
                    nResults: top_k})
                let asJSON = JSON.stringify(closest_chunks);
                //console.log(await resultfile.json())
                return new Response(asJSON,  {headers: {
                    "Content-Type": "application/json",
                }});
            }
            return new Response("hmmmmm");//resultfile);
        } else {      
            return new Response("Bunnnn!");
        }
    },
    tls: {
        cert: Bun.file("./tls/fullchain.pem"),
        key: Bun.file("./tls/privkey.pem"),
    }
});

console.log(`Listening on http://0.0.0.0:${server.port} ...`);

const replicate = new Replicate({
    auth: ""+process.env.REPLICATE_API_TOKEN
});

const queryEmbRequest = async (q_arr:Array<string>) => {
    var result = await replicate.run(
        "center-for-curriculum-redesign/bge_1-5_query_embeddings:438621acdb4511d2d9c6296860588ee6c60c3df63c93e2012297db8bb965732d",
        {
          input: {
            query_texts: JSON.stringify(q_arr)
          }
        }) as any;
    return result?.query_embeddings;
}
