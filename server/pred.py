import numpy as np  # linear algebra
import pandas as pd  # data processing, CSV file I/O (e.g. pd.read_csv)
import pickle
import json
import re
from sklearn.base import BaseEstimator, TransformerMixin
from nltk.corpus import stopwords
import nltk


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


# nltk.download('stopwords')
stopWords = set(stopwords.words('english'))

clf = pickle.load(open('model/model.h5', 'rb'))

# submission = pd.read_csv('data/test.csv')
sub = {'id': ['id20000'], 'text': ['hello world, testing']}


def predict(sub):
    submission = pd.DataFrame(data=sub, columns=['id', 'text'])

    # preprocessing
    submission = processing(submission)

    cols = clf.best_estimator_.named_steps['classifier'].classes_
    predictions = clf.predict_proba(submission)[0]

    preds = {}
    for A, B in zip(cols, predictions):
        preds[A] = B

    result = pd.Series(data=preds)
    # preds = pd.Series(
    #    data=predictions, index=clf.best_estimator_.named_steps['classifier'].classes_)

    # print(preds.to_json(orient="split"))
    # generating a submission file
    # result = pd.concat([submission[['id']], preds], axis=1)
    # result.set_index('id', inplace=True)
    # print(result.head())

    return result


print(predict(sub))
