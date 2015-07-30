import ConfigParser
import json
import os
import string
import code
import readline
import rlcompleter

from conf import settings

from keystoneclient.v3 import client

from fabric.api import task
from fabric.tasks import Task
from fabric.state import env
from fabric.api import execute

def _register_user(keystone, name, activate=True):
    email = name + '@test.com'
    user = keystone.user_registration.users.register_user(
        name=email,
        password='test',
        username=name,
        domain=settings.KEYSTONE_DEFAULT_DOMAIN)
    if activate:
        user = keystone.user_registration.users.activate_user(
            user=user.id,
            activation_key=user.activation_key)
    return user

@task
def test_data(keystone_path=settings.KEYSTONE_ROOT):
    """Populate the database with some users, organizations and applications
    for convenience"""

    # Log as idm
    config = ConfigParser.ConfigParser()
    config.read(keystone_path + 'etc/keystone.conf')
    admin_port = config.get('DEFAULT', 'admin_port')
    endpoint = 'http://{ip}:{port}/v3'.format(ip='127.0.0.1',
                                              port=admin_port)
    keystone = client.Client(
        username=settings.IDM_USER_CREDENTIALS['username'],
        password=settings.IDM_USER_CREDENTIALS['password'],
        project_name=settings.IDM_USER_CREDENTIALS['project'],
        auth_url=endpoint)

    # Create some default apps to test
    for app_name in settings.FIWARE_DEFAULT_APPS:
        app = keystone.oauth2.consumers.create(
            app_name,
            description='Default app in FIWARE',
            grant_type='authorization_code',
            client_type='confidential')
        # Create default roles
        for role_name in settings.FIWARE_DEFAULT_APPS[app_name]:
            keystone.fiware_roles.roles.create(
                name=role_name,
                is_internal=False,
                application=app.id)

    owner_role = keystone.roles.find(name='owner')

    # Create 4 users
    users = []
    for i in range(10):
        username = 'user'
        users.append(_register_user(keystone, username + str(i)))

    # Register pepProxy user

    pep_user = _register_user(keystone, 'pepproxy')

    # Create Org A and Org B

    org_a = keystone.projects.create(
        name='Organization A',
        description='Test Organization A',
        domain=settings.KEYSTONE_DEFAULT_DOMAIN,
        enabled=True,
        img='/static/dashboard/img/logos/small/group.png',
        city='',
        email='',
        website='')
    keystone.roles.grant(user=pep_user.id,
                         role=owner_role.id,
                         project=org_a.id)

    org_b = keystone.projects.create(
        name='Organization B',
        description='Test Organization B',
        domain=settings.KEYSTONE_DEFAULT_DOMAIN,
        enabled=True,
        img='/static/dashboard/img/logos/small/group.png',
        city='',
        email='',
        website='')
    keystone.roles.grant(user=pep_user.id,
                         role=owner_role.id,
                         project=org_b.id)

    # Create Devguide APP and give provider role to the pepProxy
    # TODO: modify the url + callback when the app is ready
    devguide_app = keystone.oauth2.consumers.create(
        name='FIWAREdevGuide',
        redirect_uris=['http://compose_devguide_1/login'],
        description='Fiware devGuide Test Application',
        scopes=['all_info'],
        client_type='confidential',
        grant_type='authorization_code',
        url='http://compose_devguide_1',
        img='/static/dashboard/img/logos/small/app.png')
    provider_role = next(r for r
                         in keystone.fiware_roles.roles.list()
                         if r.name == 'provider')
    keystone.fiware_roles.roles.add_to_user(
        role=provider_role.id,
        user=pep_user.id,
        application=devguide_app.id,
        organization=pep_user.default_project_id)

    # Create a role 'manager' for the application
    role_manager = keystone.fiware_roles.roles.create(
        name='manager Operations',
        is_internal=False,
        application=devguide_app.id)

    # Give it the permission to get and assign only the owned roles
 
    internal_permission_owned = next(
        p for p in keystone.fiware_roles.permissions.list()
        if p.name == settings.INTERNAL_PERMISSIONS[4])
    keystone.fiware_roles.permissions.add_to_role(
        role=role_manager,
        permission=internal_permission_owned)

    # Make user 0 owner of the organization A and give manager role
    user0 = users[0]
    
    keystone.roles.grant(user=user0.id,
                         role=owner_role.id,
                         project=org_a.id)

    keystone.fiware_roles.roles.add_to_user(
        role=role_manager.id,
        user=user0.id,
        application=devguide_app.id,
        organization=user0.default_project_id)

    # Make user 1 owner of the organization B and give manager role
    user1 = users[1]

    keystone.roles.grant(user=user1.id,
                         role=owner_role.id,
                         project=org_b.id)

    # keystone.fiware_roles.roles.add_to_user(
    #     role=role_manager.id,
    #     user=user1.id,
    #     application=devguide_app.id,
    #     organization=user1.default_project_id)

    # Adding permissions for manager

    perm0 = keystone.fiware_roles.permissions.create(
                name='reservations', 
                application=devguide_app, 
                action= 'POST', 
                resource= '/NGSI10/queryContext?limit=1000&entity_type=reservations',
                is_internal=False)

    keystone.fiware_roles.permissions.add_to_role(
                    role_manager, perm0)

    perm1 = keystone.fiware_roles.permissions.create(
                name='reviews', 
                application=devguide_app, 
                action= 'POST', 
                resource= '/NGSI10/queryContext?limit=1000&entity_type=reviews',
                is_internal=False)

    keystone.fiware_roles.permissions.add_to_role(
                    role_manager, perm1)