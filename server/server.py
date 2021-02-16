import json
import random
import flask
from flask import Response, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np  # linear algebra
import pandas as pd  # data processing, CSV file I/O (e.g. pd.read_csv)
import pickle
import json
import re
from sklearn.base import BaseEstimator, TransformerMixin
from nltk.corpus import stopwords
import nltk
from os import path

app = flask.Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def processing(df):
    # lowering and removing punctuation
    df['processed'] = df['text'].apply(
        lambda x: re.sub(r'[^\w\s]', '', x.lower()))

    # numerical feature engineering
    # total length of sentence
    df['length'] = df['processed'].apply(lambda x: len(x))
    # get number of words
    df['words'] = df['processed'].apply(lambda x: len(x.split(' ')))
    df['words_not_stopword'] = df['processed'].apply(
        lambda x: len([t for t in x.split(' ') if t not in stopWords]))
    # get the average word length
    df['avg_word_length'] = df['processed'].apply(lambda x: np.mean([len(t) for t in x.split(
        ' ') if t not in stopWords]) if len([len(t) for t in x.split(' ') if t not in stopWords]) > 0 else 0)
    # get the average word length
    df['commas'] = df['text'].apply(lambda x: x.count(','))

    return(df)


class TextSelector(BaseEstimator, TransformerMixin):
    """
    Transformer to select a single column from the data frame to perform additional transformations on
    Use on text columns in the data
    """

    def __init__(self, key):
        self.key = key

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return X[self.key]


class NumberSelector(BaseEstimator, TransformerMixin):
    """
    Transformer to select a single column from the data frame to perform additional transformations on
    Use on numeric columns in the data
    """

    def __init__(self, key):
        self.key = key

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return X[[self.key]]


nltk.download('stopwords')
stopWords = set(stopwords.words('english'))
clf = pickle.load(open('model/model.h5', 'rb'))


def predict(sub):
    submission = pd.DataFrame(data=sub, columns=['id', 'text'])

    # preprocessing
    submission = processing(submission)

    cols = clf.best_estimator_.named_steps['classifier'].classes_
    predictions = clf.predict_proba(submission)[0]

    preds = {}
    for A, B in zip(cols, predictions):
        preds[A] = B

    return preds


# placeholder
text_data = [
    {'id': 'id00011',
     'text': "hello flask!",
     'country': 'MY'},
    {'id': 'id00012',
     'text': "hello world it is me!",
     'country': 'US'},
    {'id': 'id00013',
     'text': "hello react world!",
     'country': 'DE'},
    {'id': 'id00014',
     'text': "happy new year!",
     'country': 'IN'},
]
# placeholder
dna_data = {
    'id': '00001',
    'country': [
        {'name': 'US',
         'value': 0.2,
         },
        {'name': 'MY',
         'value': 0.2,
         },
        {'name': 'IN',
         'value': 0.3,
         },
        {'name': 'DE',
         'value': 0.3,
         },
    ]
}


@app.route('/')
def home():
    return "<h1>Hello Flask!</h1>"


@app.route('/api/get/all', methods=['GET'])
def api_all():
    return jsonify(text_data)


@app.route('/api/post', methods=['POST'])
def post_text():
    if request.method == 'POST' and request.is_json:
        new_text = request.get_json()['text']
        new_country = request.get_json()['country']
        new_id = random.randrange(10000)

        new_data = '"' + str(new_id) + '",' + '"' + \
            str(new_text) + '",' + '"' + str(new_country) + '"\n'

        if not path.exists('data/train2.csv'):
            with open('data/train2.csv', 'w') as fd:
                fd.write('"id","text","country"\n')

        with open('data/train2.csv', 'a') as fd:
            fd.write(new_data)

        # predict the new data
        sub = {
            'id': [new_id],
            'text': [new_text],
        }
        result = predict(sub)
        print(result)

        return Response(
            json.dumps(result),
            mimetype='application/json',
            headers={
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*',
            }
        )


if __name__ == "__main__":
    app.run(host="localhost", port="5000", debug=True)
