MONGO_VERSION = 2.6
ORION_VERSION = 0.22.0

.PHONY: help
help:
	$(info )
	$(info This makefile will help you build docker images for the Fiware-ChanChan)
	$(info components based on the bitergia baseimages.)
	$(info )
	$(info Available options:)
	$(info )
	$(info - all:			Build all available images)
	$(info - orion: 		Build Orion Context Broker $(ORION_VERSION) image)
	$(info - mongodb: 		Build MongoDB $(MONGO_VERSION) image)
	$(info - fiware-devguide-app:	Build FIWARE Developers Guide App)
	$(info )
	$(info Other available options:)
	$(info - orion-ubuntu:		Build Orion Context Broker image using Ubuntu baseimage)
	$(info - mongodb-2.6: 		Build MongoDB 2.6 image)
	$(info - mongodb-3.0: 		Build MongoDB 3.0 image)
	$(info )
	@echo ""

.PHONY: fiware-devguide-app
fiware-devguide-app: $@
	docker build -t bitergia/$@ $@/

.PHONY: all
all: fiware-devguide-app
