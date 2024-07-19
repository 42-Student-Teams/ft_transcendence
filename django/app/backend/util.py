import datetime
import time

import requests


def timestamp_now():
    t = datetime.datetime.now(datetime.timezone.utc)
    return date_to_timestamp(t)


def date_to_timestamp(t):
    return int(time.mktime(t.timetuple()))


def get_user_info(access_token):
    url = 'https://api.intra.42.fr/v2/me'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    try:
        response = requests.get(url, headers=headers)

        # Check if the response status code is not OK (200)
        response.raise_for_status()

        # Parse the JSON response
        data = response.json()
        return data
    except requests.exceptions.HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
        raise
    except Exception as err:
        print(f'Other error occurred: {err}')
        raise