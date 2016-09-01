# keystone-provision.py
# Copyright(c) 2016 Bitergia
# Author: Bitergia <fiware-testing@bitergia.com>
# MIT Licensed
#
# Default provision for tourguide

import json
import os
import string
import code
import readline
import rlcompleter

from keystoneclient.v3 import client

IDM_USER_CREDENTIALS = {
    'username': 'idm',
    'password': 'idm',
    'project': 'idm',
}

def _register_user(keystone, name, activate=True):
    email = name + '@test.com'
    user = keystone.user_registration.users.register_user(
        name=email,
        password='test',
        username=name,
        domain='default')
    if activate:
        user = keystone.user_registration.users.activate_user(
            user=user.id,
            activation_key=user.activation_key)
    return user

def _create_organization(keystone, org_name):
    org = keystone.projects.create(
        name=org_name,
        description=('Test '+org_name),
        domain='default',
        enabled=True,
        img='/static/dashboard/img/logos/small/group.png',
        city='',
        email='',
        website='')
    return org

def test_data(keystone_path='./keystone/'):
    """Populate the database with some users, organizations and applications
    for convenience"""

    # Log as idm
    endpoint = 'http://{ip}:{port}/v3'.format(ip='127.0.0.1',
                                              port='35357')
    keystone = client.Client(
        username=IDM_USER_CREDENTIALS['username'],
        password=IDM_USER_CREDENTIALS['password'],
        project_name=IDM_USER_CREDENTIALS['project'],
        auth_url=endpoint)

    owner_role = keystone.roles.find(name='owner')

    # Create 10 users
    users = []
    for i in range(10):
        username = 'user'
        users.append(_register_user(keystone, username + str(i)))

    # Register pepProxy user
    pep_user = _register_user(keystone, 'pepproxy')

    # Create Franchises
    franchises = []

    for i in range(4):
        franchises.append(_create_organization(keystone, 'Franchise' + str(i+1)))

    for franchise in franchises:
        keystone.roles.grant(user=pep_user.id,
                         role=owner_role.id,
                         project=franchise.id)

    # Create tourguide APP and give provider role to the pepProxy
    # TODO: modify the url + callback when the app is ready
    tourguide_app = keystone.oauth2.consumers.create(
        name='TourGuide',
        redirect_uris=['http://tourguide/login'],
        description='Fiware TourGuide Application',
        scopes=['all_info'],
        client_type='confidential',
        grant_type='authorization_code',
        url='http://tourguide',
        img='/static/dashboard/img/logos/small/app.png')
    provider_role = next(r for r
                         in keystone.fiware_roles.roles.list()
                         if r.name == 'Provider')

    keystone.fiware_roles.roles.add_to_user(
        role=provider_role.id,
        user=pep_user.id,
        application=tourguide_app.id,
        organization=pep_user.default_project_id)

    # Creating roles

    # End user
    end_user = keystone.fiware_roles.roles.create(
        name='End user',
        is_internal=False,
        application=tourguide_app.id)

    # Franchise manager
    franchise_manager = keystone.fiware_roles.roles.create(
        name='Franchise manager',
        is_internal=False,
        application=tourguide_app.id)

    # Global manager
    global_manager = keystone.fiware_roles.roles.create(
        name='Global manager',
        is_internal=False,
        application=tourguide_app.id)

    # Make all users Restaurant viewers
    for user in users:
        keystone.fiware_roles.roles.add_to_user(
            role=end_user.id,
            user=user.id,
            application=tourguide_app.id,
            organization=user.default_project_id)

    # Make user0 Global Manager
    keystone.fiware_roles.roles.add_to_user(
        role=global_manager.id,
        user=users[0].id,
        application=tourguide_app.id,
        organization=users[0].default_project_id)

    keystone.fiware_roles.roles.add_to_user(
        role=franchise_manager.id,
        user=users[1].id,
        application=tourguide_app.id,
        organization=franchises[0].id)

    keystone.fiware_roles.roles.add_to_user(
        role=franchise_manager.id,
        user=users[2].id,
        application=tourguide_app.id,
        organization=franchises[1].id)

    keystone.fiware_roles.roles.add_to_user(
        role=franchise_manager.id,
        user=users[3].id,
        application=tourguide_app.id,
        organization=franchises[2].id)

    keystone.fiware_roles.roles.add_to_user(
        role=franchise_manager.id,
        user=users[4].id,
        application=tourguide_app.id,
        organization=franchises[3].id)

    for i in range(4):
        keystone.roles.grant(user=users[i+1].id,
            role=owner_role.id,
            project=franchises[i].id)

    # Make user1-4 Frnanchise Manager
    # Adding permissions for manager and restaurants (TODO)
    perm0 = keystone.fiware_roles.permissions.create(
                name='reservations',
                application=tourguide_app,
                action= 'POST',
                resource= 'NGSI10/queryContext?limit=1000&entity_type=reservation',
                is_internal=False)

    keystone.fiware_roles.permissions.add_to_role(
                    global_manager, perm0)

    perm1 = keystone.fiware_roles.permissions.create(
                name='reviews',
                application=tourguide_app,
                action= 'POST',
                resource= 'NGSI10/queryContext?limit=1000&entity_type=review',
                is_internal=False)

    keystone.fiware_roles.permissions.add_to_role(
                    global_manager, perm1)

    perm2 = keystone.fiware_roles.permissions.create(
                name='restaurants',
                application=tourguide_app,
                action= 'POST',
                resource= 'NGSI10/queryContext?limit=1000&entity_type=restaurant',
                is_internal=False)

    keystone.fiware_roles.permissions.add_to_role(
                    global_manager, perm2)

    keystone.fiware_roles.permissions.add_to_role(
                    global_manager, perm2)

test_data('./')
