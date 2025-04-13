from datetime import datetime, timedelta
import json


def graph_sensor_data(r_data):
    """
    Graphs the latest sensor data, updating:
    - hours_sensor_data.json (minute-by-minute entries within current hour)
    - todays_sensor_data.json (hourly averages for the current day)
    - weeks_sensor_data.json (daily averages for the last 7 days)
    """

    now = datetime.now()
    current_date = now.date()
    current_date_str = str(current_date)
    current_hour = str(now.hour).zfill(2)
    current_minute = str(now.minute).zfill(2)

    # Load existing data
    with open("jsons/hours_sensor_data.json", "r") as f:
        hours_j_data = json.load(f)

    with open("jsons/todays_sensor_data.json", "r") as f:
        todays_j_data = json.load(f)

    # --- HOURS SENSOR DATA HANDLING ---
    if (
        (hours_j_data["date"] == current_date_str and hours_j_data["hour"] == current_hour)
        or (hours_j_data["date"] == "" and hours_j_data["hour"] == "")
    ):
        print("IN IF")
        # Still in the same hour — just log a new minute entry
        hours_j_data["date"] = current_date_str
        hours_j_data["hour"] = current_hour
        entries = hours_j_data.get("entries", {})

        if current_minute not in entries:
            entries[current_minute] = {
                "moisture": r_data.get("moisture"),
                "ph": r_data.get("ph"),
                "temp": r_data.get("temp"),
                "light": r_data.get("light"),
            }
            hours_j_data["entries"] = entries

            with open("jsons/hours_sensor_data.json", "w") as f:
                json.dump(hours_j_data, f, indent=4)

    elif hours_j_data.get("date") == current_date_str and hours_j_data.get("hour") != current_hour:
        print("IN ELIF")
        # Hour has changed → average and dump into today's data
        entries = hours_j_data.get("entries", {})
        totals = { "moisture": 0, "ph": 0, "temp": 0, "light": 0 }
        count = 0

        for minute_data in entries.values():
            for key in totals:
                totals[key] += minute_data.get(key, 0)
            count += 1

        if count > 0:
            # --- DAY TRANSITION CHECK BEFORE UPDATING TODAY ---
            if todays_j_data.get("date") not in [current_date_str, ""]:
                # Load and update weeks data
                with open("jsons/weeks_sensor_data.json", "r") as f:
                    weeks_j_data = json.load(f)

                weeks_entries = weeks_j_data.get("entries", {})
                seven_days_ago = current_date - timedelta(days=6)

                for date_str in list(weeks_entries.keys()):
                    try:
                        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
                        if date_obj < seven_days_ago:
                            del weeks_entries[date_str]
                    except ValueError:
                        continue

                # Compute yesterday's average
                prev_entries = todays_j_data.get("entries", {})
                day_totals = { "moisture": 0, "ph": 0, "temp": 0, "light": 0 }
                day_count = 0

                for hour_data in prev_entries.values():
                    for key in day_totals:
                        day_totals[key] += hour_data.get(key, 0)
                    day_count += 1

                if day_count > 0:
                    weeks_entries[todays_j_data["date"]] = {
                        key: round(day_totals[key] / day_count, 2) for key in day_totals
                    }

                weeks_j_data["entries"] = weeks_entries

                with open("jsons/weeks_sensor_data.json", "w") as f:
                    json.dump(weeks_j_data, f, indent=4)

                # Reset today's data
                todays_j_data = {
                    "date": current_date_str,
                    "entries": {}
                }

            # --- Add this past hour's average to today's data ---
            todays_entries = todays_j_data.get("entries", {})
            todays_entries[hours_j_data["hour"]] = {
                key: round(totals[key] / count, 2) for key in totals
            }
            todays_j_data["entries"] = todays_entries
            todays_j_data["date"] = current_date_str

            with open("jsons/todays_sensor_data.json", "w") as f:
                json.dump(todays_j_data, f, indent=4)

        # --- Reset the hour data for the new hour ---
        hours_j_data = {
            "date": current_date_str,
            "hour": current_hour,
            "entries": {
                current_minute: {
                    "moisture": r_data.get("moisture"),
                    "ph": r_data.get("ph"),
                    "temp": r_data.get("temp"),
                    "light": r_data.get("light"),
                }
            }
        }

        with open("jsons/hours_sensor_data.json", "w") as f:
            json.dump(hours_j_data, f, indent=4)
    else:
        # hour and day wrong!
        # wipe hour_sensor_data.json and update it
        print("IN ELSE")
        hours_j_data["date"] = current_date_str
        hours_j_data["hour"] = current_hour

        hours_j_data["entries"][current_minute] = {
            "moisture": r_data.get("moisture"),
                "ph": r_data.get("ph"),
                "temp": r_data.get("temp"),
                "light": r_data.get("light"),
        }

        with open("jsons/hours_sensor_data.json", "w") as f:
            json.dump(hours_j_data, f, indent=4)