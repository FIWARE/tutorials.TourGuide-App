global.time1 = "2015-11-05T06:25:56.577Z" ;

global.time2 = "2015-11-06T21:57:22.604Z";

global.restaurantsJSON = [{
      "@context": "http://schema.org",
      "@type": "Restaurant1",
      "additionalProperty":[
        {
          "value": 10,
          "name": "capacity",
          "@type": "PropertyValue"
        },
        {
          "value": 1,
          "name": "occupancyLevels",
          "@type": "PropertyValue",
          "timestamp": "2016-05-31T06:52:18.169Z"
        }
      ],
      "address":{
        "streetAddress": "Street 1",
        "addressRegion": "Region 1",
        "addressLocality": "Locality 1",
        "postalCode": "11111",
        "@type": "PostalAddress"
      },
      "aggregateRating":{
        "reviewCount": 1,
        "ratingValue": 1
      },
      "department": "Franchise1",
      "description": "Restaurant description 1",
      "geo":{
      "@type": "GeoCoordinates",
      "latitude": "42.8404625",
      "longitude": "-2.5123277"
    },
    "name": "Retaurant1",
    "priceRange": 1,
    "telephone": "111 111 111"
  },
  {
    "@context": "http://schema.org",
    "@type": "Restaurant",
    "additionalProperty":[
      {
        "value": 20,
        "name": "capacity",
        "@type": "PropertyValue"
      },
      {
        "value": 2,
        "name": "occupancyLevels",
        "@type": "PropertyValue",
        "timestamp": "2016-05-31T06:52:18.169Z"
      }
    ],
    "address":{
      "streetAddress": "Street 2",
      "addressRegion": "Region 2",
      "addressLocality": "Locality 2",
      "postalCode": "22222",
      "@type": "PostalAddress"
    },
    "aggregateRating":{
      "reviewCount": 2,
      "ratingValue": 2
    },
    "department": "Franchise2",
    "description": "Restaurant description 2",
    "geo":{
      "@type": "GeoCoordinates",
      "latitude": "42.8538811",
      "longitude": "-2.7006836"
    },
    "name": "Restaurant2",
    "priceRange": 2,
    "telephone": "222 222 222",
    "url": "http://www.restaurant2.com/"
  }
];

global.reviewsJSON = [
  {
    "@context": "http://schema.org",
    "@type": "Review",
    "author":{
      "@type": "Person",
      "name": "user1"
    },
    "dateCreated": "2016-06-08T11:43:54.008Z",
    "itemReviewed":{
      "@type": "Restaurant",
      "name": "Armentegi"
    },
    "name": "542e8baee4bbdc539487eb6d53636e99ad8e0126",
    "publisher":{
      "@type": "Organization",
      "name": "Bitergia"
    },
    "reviewBody": "Body review22225555",
    "reviewRating":{
      "@type": "Rating",
      "ratingValue": 4
    }
  },
  {
    "@context": "http://schema.org",
    "@type": "Review",
    "author":{
      "@type": "Person",
      "name": "user1"
    },
    "dateCreated": "2016-06-08T11:43:54.009Z",
    "itemReviewed":{
      "@type": "Restaurant",
      "name": "Biltoki"
    },
    "name": "66f0b52ab5be9e2d25cf72707e8b1ec0dad2eff1",
    "publisher":{
      "@type": "Organization",
      "name": "Bitergia"
    },
    "reviewBody": "Body review",
    "reviewRating":{
      "@type": "Rating",
      "ratingValue": 5
    }
  }
];

global.reservationsJSON = [
  {
    "@context": "http://schema.org",
    "@type": "FoodEstablishmentReservation",
    "partySize": 19,
    "reservationFor":{
      "@type": "FoodEstablishment",
      "name": "Mitarte",
      "address":{
        "@type": "PostalAddress",
        "streetAddress": "De La Rioja Hiribidea 7",
        "addressRegion": "Araba",
        "addressLocality": "Labastida",
        "postalCode": "01330"
      }
    },
    "reservationId": "ec743b4c9b46578d48f62201187020397f88037c",
    "reservationStatus": "Hold",
    "startTime": time1,
    "underName":{
      "@type": "Person",
      "name": "user1"
    }
  },
  {
    "@context": "http://schema.org",
    "@type": "FoodEstablishmentReservation",
    "partySize": 8,
    "reservationFor":{
      "@type": "FoodEstablishment",
      "name": "El Medoc Alavés",
      "address":{
        "@type": "PostalAddress",
        "streetAddress": "San Raimundo Hiribidea 15",
        "addressRegion": "Araba",
        "addressLocality": "Guardia",
        "postalCode": "01300"
      }
    },
    "reservationId": "1212bc7fff8c7fb8bf3848f839e1dc810cf4911e",
    "reservationStatus": "Pending",
    "startTime": time2,
    "underName":{
      "@type": "Person",
      "name": "user1"
    }
  }
];
