from flask import Flask, jsonify, request
from flask_cors import CORS

import json

from graph_sensor_data import graph_sensor_data


app = Flask(__name__)
CORS(app)  # Allows requests from React

@app.route("/get_sensor_data")
def get_sensor_data():
    """
    POLLED by frontend every 5 seconds
    
    returns: latest sensor data from local json
    """

    with open("jsons/latest_sensor_data.json", "r") as f:
        data = json.load(f)
    
    return data
    

@app.route("/put_sensor_data", methods=['PUT'])
def put_sensor_data():
    r_data = request.get_json()

    graph_sensor_data(r_data)
    print("data:", r_data)

    # opens local json
    with open("jsons/latest_sensor_data.json", "r") as f:
        j_data = json.load(f)

    # moves data from request json to local json
    j_data["moisture"] = r_data.get("moisture")
    j_data["ph"] = r_data.get("ph")
    j_data["temp"] = r_data.get("temp")
    j_data["light"] = r_data.get("light")

    # writes new data to local json
    with open("jsons/latest_sensor_data.json", "w") as f:
        json.dump(j_data, f, indent=4)

    return jsonify({"status": "OK"}), 200


@app.route("/get_today_graph", methods=['GET'])
def get_todays_graph_entries():
    """
    Called by frontend returns values for each variable for each hour for today
    """
    with open("jsons/todays_sensor_data.json", 'r') as f:
        j_data = json.load(f)
    
    return j_data

@app.route("/get_week_graph", methods=['GET'])
def get_weeks_graph_entries():
    """
    Called by frontend returns values for each variable for each day in a week
    """
    with open("jsons/weeks_sensor_data.json", 'r') as f:
        j_data = json.load(f)

    return j_data

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=8085)