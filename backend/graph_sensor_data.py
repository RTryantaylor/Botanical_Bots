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
            todays_j_data["entries"][current_hour] = {
                "moisture": r_data.get("moisture"),
                "ph": r_data.get("ph"),
                "temp": r_data.get("temp"),
                "light": r_data.get("light")
            }

            with open("jsons/todays_sensor_data.json", "w") as f:
                json.dump(todays_j_data, f, indent=4)
    else: # need to restructure jsons we are on the next day...

        # first clean up weeks_sensor_data.json
        seven_days_ago = current_date - timedelta(days=6)  # including today go back 6 days

        with open("jsons/weeks_sensor_data.json", 'r') as f:
            weeks_j_data = json.load(f)
        
        weeks_entries = weeks_j_data.get("entries", {})
        for date in weeks_entries:
            if date < seven_days_ago: # occured later than 7 days ago
                del weeks_j_data["entries"][date] # delete old entries
        
        # now we calculate averages of prev days's entries
        entries = today_j_data.get("entries", {})

        curr_day_totals = {
            "moisture": 0,
            "ph": 0,
            "temp": 0,
            "light": 0
        }
        count = 0

        # add up values from each entry
        for hour_data in entries.values():
            for key in curr_day_totals:
                curr_day_totals[key] += hour_data.get(key, 0)
            count += 1

        # calculate averages
        if count > 0:
            weeks_j_data["entries"][current_date] = {key: round(curr_day_totals[key] / count, 2) for key in curr_day_totals}

        with open("jsons/weeks_sensor_data.json", 'w') as f:
            json.dump(weeks_j_data, f, indent=4)

        # finally reset todays_sensor_data.json to new data
        todays_j_data["date"] = current_date
        todays_j_data["entries"] = {
            "moisture": r_data.get("moisture"),
            "ph": r_data.get("ph"),
            "temp": r_data.get("temp"),
            "light": r_data.get("light")
        }

        with open("jsons/todays_sensor_data.json", 'w') as f:
            json.dump(todays_j_data, f, indent=4)





