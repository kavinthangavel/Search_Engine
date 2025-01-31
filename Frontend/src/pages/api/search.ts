import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

// ------------------------------------------------------------------
// 1) Connect to the same cluster and DB used in the Python script
// ------------------------------------------------------------------
const uri = "mongodb+srv://root:root@cluster0.hc4z2.mongodb.net/";
const client = new MongoClient(uri);

// ------------------------------------------------------------------
// 2) Tokenize user query (very simple example)
// ------------------------------------------------------------------
function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean); // remove any empty strings
}

// ------------------------------------------------------------------
// 3) The API route handler
// ------------------------------------------------------------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // a) Parse query parameter from URL: ?query=somewords
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter "query" is required' });
    }

    // b) Tokenize the user input
    const tokens = tokenize(query);
    if (tokens.length === 0) {
      return res.status(200).json({ query, tokens: [], results: [] });
    }

    // c) Connect to Mongo
    await client.connect();

    // d) Get your DB ("Indexer") and collection ("Words"),
    //    matching the Python script
    const db = client.db("Indexer");
    const wordsCollection = db.collection("Words");

    // e) We'll store docNo => cumulative score (summing TF across tokens)
    const docScores: Record<number, number> = {};

    // f) For each token, find the entry in "Words" (inverted index)
    for (const token of tokens) {
      const tokenDoc = await wordsCollection.findOne({ word: token });
      if (!tokenDoc) {
        // No doc for this token - skip
        continue;
      }

      // Each tokenDoc should have an array: tokenDoc.info_list
      if (Array.isArray(tokenDoc.info_list)) {
        for (const info of tokenDoc.info_list) {
          // docNo is a number you assigned in the Python script
          const docNo = info.doc_no;
          // tf is the float value for that word in that doc
          const tfVal = info.tf;

          if (!docScores[docNo]) {
            docScores[docNo] = 0;
          }
          docScores[docNo] += tfVal;
        }
      }
    }

    // g) Sort docs by cumulative TF score
    //    Convert docScores object to array of [docNo, score], then sort
    const sortedDocs = Object.entries(docScores)
      .sort(([, scoreA], [, scoreB]) => (scoreB as number) - (scoreA as number))
      .map(([docNoStr, score]) => ({
        docNo: parseInt(docNoStr, 10),
        score
      }));

    // h) Build docNo -> link map, if you want direct links to each doc
    //    We can do another pass to find each link from the words data
    //    Or just store the first link we see for that docNo
    const docNoToLink: Record<number, string> = {};

    for (const token of tokens) {
      const tokenDoc = await wordsCollection.findOne({ word: token });
      if (!tokenDoc) continue;

      if (Array.isArray(tokenDoc.info_list)) {
        for (const info of tokenDoc.info_list) {
          // Only assign link if docScores[docNo] exists (meaning it matched)
          // and if we haven't set it before
          if (docScores[info.doc_no] && !docNoToLink[info.doc_no]) {
            docNoToLink[info.doc_no] = info.link;
          }
        }
      }
    }

    // i) Format final results with docNo, score, and link
    const results = sortedDocs.map(({ docNo, score }) => ({
      doc_no: docNo,
      score,
      link: docNoToLink[docNo] || null,
    }));

    // j) Return JSON
    return res.status(200).json({
      query,
      tokens,
      results,
    });

  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      error: 'Failed to fetch search results',
      details: String(error),
    });
  } finally {
    // In a real app, you might want a global connection pool. For now, close it.
    await client.close();
  }
}
