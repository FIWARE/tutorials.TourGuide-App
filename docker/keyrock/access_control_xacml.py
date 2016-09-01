import logging
import json
import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'openstack_dashboard.settings'
from openstack_dashboard import settings
from openstack_dashboard import fiware_api

with open('/opt/config.json') as data_file:
    data = json.load(data_file)
app_id = data['id']

request=None

role_permissions = {}
public_roles = [
    role for role in fiware_api.keystone.role_list(
        request, application=app_id)
    if role.is_internal == False
]

for role in public_roles:
    public_permissions = [
        perm for perm in fiware_api.keystone.permission_list(
        request, role=role.id)
        if perm.is_internal == False
    ]
    if public_permissions:
        role_permissions[role.id] = public_permissions

application = fiware_api.keystone.application_get(request, app_id)
fiware_api.access_control_ge.policyset_update(
    request,
    application=application,
    role_permissions=role_permissions)
