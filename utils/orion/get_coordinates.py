from requests import get
from re import match

# This function is the one processing the response list of entities, the one really doing the work
def process(r):
    for cr in r['contextResponses']:
        ce = cr['contextElement']
        for attr in ce['attributes']:
            if attr['name'] == 'position':
               print attr['value']

# Let's use pages of 100 entities
# Get first bunch of data
response = get('http://localhost:1026/v1/contextEntityTypes/Restaurant?offset=0&limit=100&details=on', 
               headers={'Accept': 'application/json', 'Fiware-Service': 'devguide'})
r = response.json()

# Get count
details = r['errorCode']['details']
m = match(r"Count: (\d+)", details)
count = int(m.group(1))

# Process the response
process(r)

# Number of batches
batches = count / 100
for i in range(0, batches):
   offset = (i + 1) * 100
   response = get('http://localhost:1026/v1/contextEntityTypes/Restaurant?offset=' + str(offset) + '&limit=100',
               headers={'Accept': 'application/json', 'Fiware-Service': 'devguide'})
   r = response.json()
   process(r)
