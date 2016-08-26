# client

**Table of Contents**  

- [Folders](#folders)
  - [addons](#addons)
  - [img](#img)
  - [js](#js)
  - [spec](#spec)
  - [stylesheets](#stylesheets)
- [Files](#files)
  - [.jshintrc](#jshintrc)
  - [Gruntfile.js](#gruntfilejs)
  - [index.html](#indexhtml)
  - [myReservations.html](#myreservationshtml)
  - [myReviews.html](#myreviewshtml)
  - [organizationReservations.html](#organizationreservationshtml)
  - [organizationRestaurants.html](#organizationrestaurantshtml)
  - [organizationReviews.html](#organizationreviewshtml)
  - [package.json](#packagejson)


## Folders

### addons

It contains the JS addons used to improve the user experience.

### img

Folder where used images are stored.

### js

Contains the JavaScript files used for the Tourguide client:
  
  - **bootstrap**: Folder that contains bootstrap files.
  - **AJAXRequest.js**: Auxiliary module to perform AJAX requests.
  - **clientLogic.js**: Specify the client application behaviour. 
  It interconnects the restaurantsAPI and the drawModule modules.
  - **connectionsAPI.js**: Module responsible for user management and connections.
  - **drawModule.js**: Rendering module.
  - **index.js**: Initializations for main view.
  - **myReservations.js**: Initializations for user reservations view.
  - **myReviews.js**: Initializations for user reviews view.
  - **organizationReservations.js**: Initializations for user organization
   reservations view.
  - **organizationRestaurants.js**: Initializations for user organization
   restaurants view.
  - **organizationReviews.js**: Initializations for user organization
   reviews view.
  - **RestaurantAPI.js**: Module that contains wraps to the Tourguide application.
  It also provides some functions to simplify the responses.
  - **utils.js**: Contains utilities used by other modules.

### spec

It contains unit test for the client.


### stylesheets

It contains the CSS used by the application.


## Files

### .jshintrc

Configuration file for the [JSHint code style linter](http://jshint.com/).


### Gruntfile.js

[Grunt task runner](http://gruntjs.com/) configuration file. It contains a set of tasks to automate and perform repetitive operations like linting or testing.


### index.html

Tourguide application main view. All restaurants are displayed and, if the user is logged in, it allows to create a review or perform a reservation.

### myReservations.html

User reservations view. It allows to manage reservations made by the user.

### myReviews.html

User reviews view. It allows to manage reviews made by the user.

### organizationReservations.html

Organization reservations view. It allows to manage the organization reservations.

### organizationRestaurants.html

Organization restaurants view. It displays all restaurants for one organization and allows to manage them.

### organizationReviews.html

Organization reviews view. Organization reservations view. It allows to manage the organization reviews.

### package.json

Provides information to [npm](https://www.npmjs.com/) that allows to identify the project and handle the project dependencies.
