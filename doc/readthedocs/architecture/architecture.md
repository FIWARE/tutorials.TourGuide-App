## Architecture

![Architecture diagram](https://github.com/Fiware/tutorials.TourGuide-App/blob/master/doc/img/archDiagram.png?raw=true "Architecture diagram")

It includes (for the moment) the following components:

* [Orion Context Broker](http://catalogue.fiware.org/enablers/publishsubscribe-context-broker-orion-context-broker), providing the NGSIv2 interfaces.
* [Backend Device Management - IDAS](http://catalogue.fiware.org/enablers/backend-device-management-idas),  to connect IoT devices (temperature & humidity).
* [Cygnus](https://github.com/telefonicaid/fiware-cygnus) for the [Cosmos ecosystem](http://catalogue.fiware.org/enablers/bigdata-analysis-cosmos) to give persistance to the context data (using its sinks).
* [Authorization PDP - AuthZForce](http://catalogue.fiware.org/enablers/authorization-pdp-authzforce), to get authorization decisions based on authorization policies.
* [PEP Proxy - Wilma](https://github.com/ging/fi-ware-pep-proxy), to add authentication and authorization security to the application.
* [IDM KeyRock](https://github.com/ging/fi-ware-idm), covering the user profile management, authorization and authentication among others.
* [Complex Event Processing - CEP - Proton](http://catalogue.fiware.org/enablers/complex-event-processing-cep-proactive-technology-online), to analyse real-time events, detect certain conditions and report that situation to external consumers.
