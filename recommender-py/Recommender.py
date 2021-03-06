from flask import Flask
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo
from flask import Response
from flask import request
from flask import json
import urllib
from math import sqrt
import numpy as np
from sklearn.metrics.pairwise import pairwise_distances
from bson.json_util import loads
from bson import json_util
from flask_cors import CORS
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)
app.config['MONGO_DBNAME'] = 'local'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/ultiprep-db'
mongo = PyMongo(app)

def predict(ratings, similarity):
    mean_user_rating = ratings.mean(axis=1)
    ratings_diff = (ratings - mean_user_rating[:, np.newaxis])
    pred = mean_user_rating[:, np.newaxis] + similarity.dot(ratings_diff) / np.array([np.abs(similarity).sum(axis=1)]).T
    return pred

@app.route('/recommendedNotes', methods=['GET'])
def recommendedNotes():
  name = request.args.get('name')
  print name
  #, { 'data.isTrashed': 'false' }
  result = list(mongo.db.events.aggregate(
  [{ "$match": { "$and": [ {'type': {"$in" : ['note_update','note_open','note_pin','note_copy','note_create','note_share']}} ]}},
      {"$group" : {
           "_id" :  {'user':"$user",  'note' : "$data._id"},
           'rating': {"$sum": 1 }
        }
      },
        {"$sort":{'_id.user':1}}
   ]
  ))

  print result
  notesResult = []
  if len(result) == 0:
    return jsonify({'result' : notesResult})

  users = mongo.db.events.distinct('user')
  users.append(name)
  notes = mongo.db.events.distinct('data._id')
  
  data = np.zeros((len(users), len(notes)))

  
  for i in result:
    print "fusgukfgsdlfgkfgdls"
    user = i["_id"]["user"]
    note = i["_id"]["note"]
    data[users.index(user)][notes.index(note)] = i["rating"]

  print "matrix"
  print data
  user_similarity = pairwise_distances(data,metric='cosine')
  print "similarity"
  print user_similarity

  user_similarity = 1 - user_similarity
  print user_similarity
  try:
    user_prediction = predict(data,user_similarity)
  except ValueError as e:
    return jsonify({'result' : notesResult})
  print "prediction"
  
  prediction = np.argsort(-user_prediction[users.index(name)])
  print user_prediction
  result = [notes[i] for i in prediction]

  print result

  

  for i in result:
   # , {'author' : {"$eq" : name}}, { "$or": [ {'contributors' : {"$in" : [name]}}, {'public' : 'true'}] }
    #print i
    t = i.encode('ascii','ignore')
    n = mongo.db.notes.find({ "$and": [ {'_id' : ObjectId(t)}, { "$or": [ {'contributors' : {"$in" : [name]}}, {'author' : {"$eq" : name}}, {'public' : 'true'}] }] })
    #({ "$and": [ {'_id' : ObjectId(t)}, { "$or": [ {'contributors' : {"$in" : [name]}}, {'author' : {"$eq" : name}}, {'public' : 'true'}] }] })

    if n.count() > 0:
      print "dsd"
      #oid = str(n[0]["_id"])
      #n[0]["_id"] = oid
      json = json_util.dumps(n[0])
      #print json
      notesResult.append(json)
  #print notesResult
  return jsonify({'result' : notesResult})



if __name__ == '__main__':
    app.run(host='0.0.0.0', port='8082')
