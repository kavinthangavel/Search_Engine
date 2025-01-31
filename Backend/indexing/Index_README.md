
## Pre-Requisite- Package Installation

To index the webpages, run the command below in terminal. This command installs the required packages for web-indexing:

```bash
  pip install bs4 nltk pymongo
```

# Web Indexing 

Web indexing is a tool used for searching web documents, such as individual websites, collections of websites, or webpages. It provides a browsable list of terms or sections leading to further reading or resources on the desired topic.

## The Pre-requisites of Web Indexing

1. We crawled some websites from a "majestic million" `.csv` file and stored the data in a Virtual Machine.
2. The crawled websites are then indexed.

## What We Did

1. The crawled websites contain HTML files, which are not just plain text. We need to extract the text from these `.html` files for tokenization and indexing. We run an *html_parser* to extract the text from the tags.

2. After extracting the text, we perform text pre-processing, specifically "Natural Language Processing" to remove stopwords. Stopwords are words that are irrelevant to a search query. We use a predefined set of stopwords from the `corpus` package and convert the text to lowercase during preprocessing.

## Importance of TF-IDF in Natural Language Processing

Term Frequency (TF) and Inverse Document Frequency (IDF) are essential concepts in natural language processing and information retrieval, commonly used in text analysis and search engines. They quantify the importance of words in a document or a corpus.

1. **Term Frequency (TF):**
   - TF measures how often a term (word) appears in a document.
   - It is calculated by dividing the number of times a term appears by the total number of terms in that document.
   - **`TF(t,d) = Number of times term t appears in document d / Total number of terms in document d`**

2. **Inverse Document Frequency (IDF):**
   - IDF measures how important a term is across multiple documents in a corpus.
   - It is calculated by taking the logarithm of the total number of documents divided by the number of documents containing the term, adding 1 to the result.
   - **`IDF(t,D) = log(Number of documents containing term t in the corpus / Total number of documents in the corpus D) + 1`**

3. **Term-Frequency Inverse Document Frequency (TF-IDF):**
   - TF-IDF is the product of TF and IDF, representing the importance of a term in a document relative to its importance in the entire corpus.
   - **`TF-IDF(t,d,D) = TF(t,d) × IDF(t,D)`**

## The MongoDB

To efficiently manage indexed data, we use MongoDB, a NoSQL database that stores data in a JSON-like format, making it suitable for unstructured or semi-structured data.

A `mongo_uri` (Uniform Resource Identifier) connects the Python file with the Mongo Cluster. Databases, collections, and documents are created implicitly in Python using MongoURI.

## Data Insertion

There are two collections in the Database:
- **Websites:** To store indexed website links.
- **Words:** To store pre-processed, tokenized, and stopwords-free words.

Data is inserted document-wise, with each document representing a webpage.

## The Use of CosmosDB

We utilized CosmosDB to store the indexed data, specifically choosing the MongoDB API for Cosmos DB. This API allows interaction with Cosmos DB using familiar MongoDB drivers and tools.

- **Cosmos DB Account Creation:** An Azure Cosmos DB account is created, specifying the MongoDB API.

- **MongoDB Cluster Configuration:** A MongoDB cluster is configured within the Cosmos DB account, serving as the backend for storing indexed webpage data.

- **Connection String Generation:** A connection string is generated, allowing the Python application to connect to the Cosmos DB MongoDB cluster.

- **Python Indexing Script:** A Python script is written to connect to the Cosmos DB MongoDB cluster, indexing webpages, and storing data in the configured Cosmos DB database and collection.

- **Document Storage:** Each webpage's data is stored as documents in the Cosmos DB MongoDB collection.

## Database Migration to Kaggle

The database size reached nearly 5.3 GB, and to ensure accessibility and safekeeping, it was successfully moved to Kaggle. This migration ensures continued availability and ease of use for the indexed data.
