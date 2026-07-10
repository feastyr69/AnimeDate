import os
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_community.vectorstores import PGVector
from langchain_core.documents import Document
from dotenv import load_dotenv

load_dotenv()

CONNECTION_STRING = os.getenv("DATABASE_URL")
if CONNECTION_STRING and CONNECTION_STRING.startswith("postgres://"):
    CONNECTION_STRING = CONNECTION_STRING.replace("postgres://", "postgresql://", 1)

COLLECTION_NAME = "waifu_chat_memory"

huggingface_token = os.getenv("HUGGINGFACE_TOKEN")

embeddings = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=huggingface_token,
)

vector_store = PGVector(
    connection_string=CONNECTION_STRING,
    embedding_function=embeddings,
    collection_name=COLLECTION_NAME,
)

def save_memory(user_msg: str, waifu_msg: str):
    # Sanitize user input to prevent XML injection in our sandbox later
    sanitized_user_msg = user_msg.replace("<", "&lt;").replace(">", "&gt;")
    doc = Document(page_content=f"User: {sanitized_user_msg}\nWaifu: {waifu_msg}")
    vector_store.add_documents([doc])

def retrieve_memory(query: str, k: int = 3) -> str:
    # Handle if table is empty gracefully
    try:
        results = vector_store.similarity_search(query, k=k)
        if not results:
            return "No previous relevant memories."
        return "\n\n".join([res.page_content for res in results])
    except Exception as e:
        print(f"Error retrieving memory: {e}")
        return "No previous relevant memories."
