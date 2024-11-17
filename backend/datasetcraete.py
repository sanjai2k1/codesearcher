import pandas as pd
from sentence_transformers import SentenceTransformer

# Sample data
data = {
    "code": [
        "<button class='btn btn-primary' onclick='submitForm()'>Submit</button>",
        "<form id='contact-form'><input type='text' id='name' placeholder='Enter your name'></form>",
        "<div class='container'><p>Welcome to our website</p></div>"
    ],
    "context": [
        "A button element for submitting the form.",
        "A form element with an input field for the user's name.",
        "A container that holds a welcome message."
    ],
    "filename": [
        "index.html",
        "contact_form.html",
        "home.html"
    ],
    "keywords": [
        ["submit", "button", "form", "click"],
        ["form", "input", "name", "text", "placeholder"],
        ["container", "text", "paragraph"]
    ]
}

# Initialize the Sentence-BERT model
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

# Create embeddings for each code context
data['code_embedding'] = [sentence_model.encode(code) for code in data['code']]

# Convert embeddings to string format with commas separating values
data['code_embedding'] = [str(embed.tolist()) for embed in data['code_embedding']]

# Save the dataset to CSV
df = pd.DataFrame(data)
df.to_csv('code_data_with_embeddings.csv', index=False)

print("Dataset saved successfully.")
