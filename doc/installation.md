# Installation

## Installing Docker

First of all you need to install Docker. Docker is a container technology which allows to instantiate different FIWARE components isolated into their respective environments. Below you can find relevant links which describe how to install Docker on different platforms.

### Windows

You can find detailed information on how to install it [here](https://docs.docker.com/engine/installation/windows/).

### Mac

You can find detailed information on how to install it [here](https://docs.docker.com/engine/installation/mac/).

### Linux

Docker is supported on the main Linux distributions. Find detailed information on how to install it [here](https://docs.docker.com/engine/installation/linux).

## Installing Docker-compose

Next step is installing docker-compose. This tool allows to instantiate different containers that have dependencies between them. The configuration of the containers to be instantiated is normally described by a file named docker-compose.yml.

### Windows

By installing Docker (any method) it satisfies this requirement.

### Mac

By installing Docker (any method) it satisfies this requirement.

### Linux

A complete guide for installing Docker Compose can be found [here](https://docs.docker.com/compose/install/).

## Clone repository

Once you have all the tools needed you can start by cloning the Github repository of the Tour Guide Application. If you have not previously installed git, please have a look at this [link](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) which explains how to install git.

- Open Terminal (or Git Terminal if using Windows).
- Change the current working directory to the location where you want the cloned directory to be made.
- Clone the repository:
```
git clone https://github.com/Fiware/tutorials.TourGuide-App.git
```
Note that `develop` branch is set as default.

Now you have all the code downloaded on your machine. If you want to just run the Tour Guide Application follow the instructions provided in the section [using the front-end application](#using-the-front-end-application).
