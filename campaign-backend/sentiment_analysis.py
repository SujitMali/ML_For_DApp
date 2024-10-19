import pickle
import os
import sys
import json

svm_model_path = os.path.join(os.path.dirname(__file__), 'svm_campaign_classifier.pkl')
vectorizer_path = os.path.join(os.path.dirname(__file__), 'tfidf_vectorizer.pkl')

with open(svm_model_path, 'rb') as model_file:
    model = pickle.load(model_file)

with open(vectorizer_path, 'rb') as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

def preprocess_text(text):
    return text.lower()

def preprocess_title(title):
    return title.lower()

def preprocess_combined_text(title, text):
    title = preprocess_title(title)
    text = preprocess_text(text)
    return title + " " + text


def predict_campaign(text, title):
    combined_text = preprocess_combined_text(title, text)
    vectorized_text = vectorizer.transform([combined_text])

    probabilities = model.predict_proba(vectorized_text)[0]
    
    not_genuine_prob = probabilities[0] * 100  
    potentially_genuine_prob = probabilities[1] * 100 
    genuine_prob = probabilities[2] * 100  
    # Not genuine, Potentially genuine, Genuine
    # ng - not genuine, pg - potentially genuine, g - genuine
    result =  {
        'ng': not_genuine_prob,
        'pg': potentially_genuine_prob,
        'g': genuine_prob
    }
    return json.dumps(result, indent=4)


if __name__ == '__main__':
    text = sys.argv[1]
    title = sys.argv[2]
    predictions = predict_campaign(text, title)
    print(predictions)
