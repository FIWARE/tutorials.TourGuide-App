MONGO_VERSION = 2.6
ORION_VERSION = 0.22.0

.PHONY: help
help:
	$(info )
	$(info This makefile will help you build docker images for the tutorials.TourGuide-App)
	$(info components based on the bitergia baseimages.)
	$(info )
	$(info Available options:)
	$(info )
	$(info - all:			Build all available images)
	$(info - tutorials.TourGuide-App:	Build FIWARE TourGuide App)
	$(info )
	@echo ""

.PHONY: tutorials.tourguide-app
tutorials.tourguide-app: $@
	docker build -t fiware/$@ $@/

.PHONY: all
all: tutorials.tourguide-app
