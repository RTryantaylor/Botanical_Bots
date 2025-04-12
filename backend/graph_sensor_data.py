from datetime import datetime
import json
import os


def graph_sensor_data(r_data):
    """
    Graphs the latest sensor data, updating todays_sensor_data.json
    and weeks_sensor_data.json

    r_data = request body sent to main.py
    """
    now = datetime.now()
    current_date = str(now.date())
    current_hour = str(now.hour)

    with open("jsons/todays_sensor_data.json", "r") as f:
        todays_j_data = json.load(f)

    if (todays_j_data["date"] == current_date or todays_j_data["date"] == ""):
        # NOTE: for now just adding one entry per hour, maybe avg out in the future
        todays_j_data["date"] = current_date # in case date = ""

        entries = todays_j_data.get("entries", {})

        if (current_hour not in entries):
            print("PRINTING", todays_j_data["entries"])
            todays_j_data["entries"][current_hour] = {
                "moisture": r_data.get("moisture"),
                "ph": r_data.get("ph"),
                "temp": r_data.get("temp"),
                "light": r_data.get("light")
            }
            print("MORE PRINTING", todays_j_data)

            with open("jsons/todays_sensor_data.json", "w") as f:
                json.dump(todays_j_data, f, indent=4)
    else: # need to restructure jsons we are on the next day...
        pass
        # avg_moisture = 0
        # avg_ph = 0
        # avg_temp = 0
        # avg_light = 0
        # count = 0

        # entries = todays_j_data.get("entries", {})
        # for time in entries:
        #     count += 1
        #     avg_moisture +=



