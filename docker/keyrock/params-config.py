#!/usr/bin/env python
# -*- coding: utf-8 -*-

from sqlite3 import dbapi2 as sqlite3
import json, os, argparse

parser = argparse.ArgumentParser(description='Script to retrieva values from the database')
parser.add_argument('-n','--name', help='Name of the app to search',required=True)
parser.add_argument('-f','--file',help='File where to output the results', required=True)
parser.add_argument('-db','--database',help='Database from where to extract the data', required=True)
args = parser.parse_args()

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

# dict to be shared with the app using a JSON file
app_config = {}

# Connect to the database

con = sqlite3.connect(args.database)
con.row_factory = dict_factory
cur = con.cursor()

# Define the app name to search
t = (args.name,)

# Extract the Oauth2 client ID
try:
    cur.execute("SELECT id AS a FROM consumer_oauth2 WHERE name=?", t)
    idr = cur.fetchone()["a"]
except sqlite3.Error as e:
    print "An error occurred:", e.args[0]

# Extract the Oauth2 secret ID
try:
    cur.execute("SELECT secret AS b FROM consumer_oauth2 WHERE name=?", t)
    secretr = cur.fetchone()["b"]
except sqlite3.Error as e:
    print "An error occurred:", e.args[0]

app_config = {'id': idr, 'secret': secretr}

# Extract the organizations names
try:
    cur.execute("SELECT name FROM project WHERE name LIKE '%organization%'")
    orgs = cur.fetchall()
except sqlite3.Error as e:
    print "An error occurred:", e.args[0]

orgs_list = []
for org in orgs:
    orgs_list.append(org['name'])

app_config['orgs'] = orgs_list;

# Write the JSON file
f = open(args.file, 'w')
f.writelines(json.dumps(app_config,
                        sort_keys=True,
                        indent=4, separators=(',', ': ')))
f.close()


con.close()
