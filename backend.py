from flask import Flask, request, jsonify
from transformers import pipeline
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)

# Load the summarization model
print("Loading summarization model...")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
print("Model loaded successfully.")

def chunk_text(text, max_chunk_size=1000):
    """
    Split the input text into smaller chunks to avoid model limitations.
    Each chunk will have at most `max_chunk_size` characters.
    """
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0

    for word in words:
        current_size += len(word) + 1  # Add 1 for the space
        if current_size <= max_chunk_size:
            current_chunk.append(word)
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_size = len(word) + 1

    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

def summarize_chunk(chunk):
    """
    Summarize a single text chunk using the summarizer model.
    """
    summary = summarizer(chunk, max_length=80, min_length=30, do_sample=False)
    return summary[0]['summary_text']

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Split the text into manageable chunks
        chunks = chunk_text(text, max_chunk_size=1000)

        # Summarize each chunk in parallel
        with ThreadPoolExecutor() as executor:
            summaries = list(executor.map(summarize_chunk, chunks))

        # Combine all the summaries into bullet points
        formatted_summary = "\n".join([f"• {summary}" for summary in summaries])

        return jsonify({"summary": formatted_summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
