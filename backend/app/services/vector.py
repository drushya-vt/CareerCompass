from app.core.config import chroma_client, openai_client

def query_vector_store(query, n_results=3):
    collection = chroma_client.get_collection(name="job_descriptions_batch")
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=query
    ).data[0].embedding
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
