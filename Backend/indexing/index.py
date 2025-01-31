import os
import pymongo
import nltk
import numpy as np
from io import BytesIO
from bs4 import BeautifulSoup
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter

# Define local folder path
local_folder_path = 'results_folder'

# Update connection string with your actual CosmosDB connection string
cosmosdb_connection_string = "mongodb+srv://root:root@cluster0.hc4z2.mongodb.net/"
client = pymongo.MongoClient(cosmosdb_connection_string)
db = client["Indexer"]
collection = db["Words"]
indexed_pages_collection = db["Indexed pages"]

# Download necessary nltk data
nltk.download('stopwords')
nltk.download('punkt_tab')

# Setup stop words and stemmer
stop_words = set(stopwords.words("english"))
ps = PorterStemmer()

# Global document counter
global_doc_number = 0
tf_calculated = False

def extract_text_from_html(html_content):
    """Extracts text from an HTML file."""
    soup = BeautifulSoup(html_content, 'html.parser')
    text = soup.get_text(separator=" ", strip=True)
    return text.lower()

def preprocess_text(text):
    """Tokenizes, removes stopwords, and applies stemming."""
    words = nltk.word_tokenize(text)
    words = [ps.stem(word) for word in words if word.isalnum() and word not in stop_words]
    return words

def calculate_tf(documents):
    """Calculates TF matrix using TfidfVectorizer."""
    if not any(documents):
        return None, None

    vectorizer = TfidfVectorizer()
    tf_matrix = vectorizer.fit_transform(documents)
    feature_names = vectorizer.get_feature_names_out()
    return tf_matrix, feature_names

# Traverse through local folder
for root, dirs, files in os.walk(local_folder_path):
    for file_name in files:
        if file_name.endswith(".html"):
            global_doc_number += 1  # Increment document counter
            doc_number = global_doc_number

            # Define subfolder and text file paths
            subfolder_name = os.path.relpath(root, local_folder_path)
            text_file_name = f"{subfolder_name}.txt"
            text_file_path = os.path.join(local_folder_path, text_file_name)

            # Check if the text file already exists (avoid duplicate extraction)
            if os.path.exists(text_file_path):
                print(f"Text file {text_file_name} already exists. Doing indexing...")
            else:
                # Extract HTML content
                file_path = os.path.join(root, file_name)
                with open(file_path, 'r', encoding='utf-8') as file:
                    html_content = file.read()
                
                text = extract_text_from_html(html_content)

                # Save extracted text
                with open(text_file_path, 'w', encoding='utf-8') as txt_file:
                    txt_file.write(text)

            # Perform text processing and indexing
            with open(text_file_path, 'r', encoding='utf-8') as txt_file:
                text = txt_file.read()

            words = preprocess_text(text)
            word_freq = Counter(words)

            tf_matrix, feature_names = calculate_tf([text])

            if tf_matrix is not None and feature_names is not None:
                tf_calculated = True

                if not indexed_pages_collection.find_one({"link": subfolder_name}):
                    for word, freq in word_freq.items():
                        if word in feature_names:
                            word_index = np.where(feature_names == word)[0][0]
                            tf_value = tf_matrix[0, word_index]

                            collection.update_one(
                                {"word": word},
                                {
                                    "$push": {
                                        "info_list": {
                                            "doc_no": doc_number,
                                            "frequency": freq,
                                            "tf": float(tf_value),
                                            "link": subfolder_name
                                        }
                                    },
                                    "$setOnInsert": {"word": word}
                                },
                                upsert=True
                            )

                    indexed_pages_collection.insert_one({"link": subfolder_name, "doc_no": doc_number})
                else:
                    print(f"TF not calculated for {subfolder_name}: Already indexed.")

if not tf_calculated:
    print("TF not calculated for any website in the local folder.")

print("Indexing complete.")
