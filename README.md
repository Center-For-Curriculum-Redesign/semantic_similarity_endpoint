# Semantic similarity with Chromadb and Replicate

This arepo contains a simple Bun / Nodejs reference implementation for a semantic similarity endpoint.
It interfaces with a local chromadb for the passage data (but you can easily modify to use whatever vector store you might prefer), and automatically hits the CCR ebeddings endpoint for embedding the input sentence. 

You can search the for the top_k most similar text passages in your database using 

```https://[your_host]:3000/?get_similar=[your search string]&top_k=[number of results you want]```

You can optionally provide an `&granularity` parameter to specify a collection to search over (intended for searching over text chunks of different sizes). By default this endpoint searches collection called `desc`, and accepts alternative granularities of `large`, `medium`, and `small`. But you will likely want to modify these to suit your usecase.

Make sure to create a .env file with a REPLICATE_API_TOKEN variable before using. You may additionally need to set up ssl for webhooks to function.

Bun and Node are largely cross-compatible, so you can make minimal changes to this code to work as a node app, or alternatively try Bun.
To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
