import datetime
import random
import string
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
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
        raise
    except Exception as err:
        print(f'Other error occurred: {err}')
        raise


def random_bot_name():
    return random.choice(['Alfred', 'Bill', 'Brandon', 'Calvin', 'Dean', 'Dustin',
                          'Ethan', 'Harold', 'Henry', 'Irving', 'Jason', 'Jenssen',
                          'Josh', 'Martin', 'Nick', 'Norm', 'Orin', 'Pat', 'Perry',
                          'Ron', 'Shawn', 'Tim', 'Will', 'Wyatt', 'Adam', 'Andy',
                          'Chris', 'Colin', 'Dennis', 'Doug', 'Duffy', 'Gary',
                          'Grant', 'Greg', 'Ian', 'Jerry', 'Jon', 'Keith', 'Mark',
                          'Matt', 'Mike', 'Nate', 'Paul', 'Scott', 'Steve', 'Tom',
                          'Yahn', 'Adrian', 'Bank', 'Brad', 'Connor', 'Dave',
                          'Dan', 'Derek', 'Don', 'Eric', 'Erik', 'Finn', 'Jeff',
                          'Kevin', 'Reed', 'Rick', 'Ted', 'Troy', 'Wade', 'Wayne',
                          'Xander', 'Xavier', 'Brian', 'Chad', 'Chet', 'Gabe',
                          'Hank', 'Ivan', 'Jim', 'Joe', 'John', 'Tony', 'Tyler',
                          'Victor', 'Vladimir', 'Zane', 'Zim', 'Cory', 'Quinn',
                          'Seth', 'Vinny', 'Arnold', 'Brett', 'Kurt', 'Kyle',
                          'Moe', 'Quade', 'Quintin', 'Ringo', 'Rip', 'Zach', 'Cliffe',
                          'Crusher', 'Gunner', 'Minh', 'Garret', 'Pheonix', 'Ridgway',
                          'Rock', 'Shark', 'Steel', 'Stone', 'Wolf', 'Vitaliy', 'Zed'])


def random_alphanum(size):
    return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(size))
