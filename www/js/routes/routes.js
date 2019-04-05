routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    name: 'driverslist',
    path: '/driverslist/:startLatitude/:startLongitude/:finishLatitude/:finishLongitude/:radius',
    async: async function (routeTo, routeFrom, resolve, reject) {
      var router = this;

      // App instance
      var app = router.app;

      let rideRequest = {
        startLatitude: routeTo.params.startLatitude,
        startLongitude: routeTo.params.startLongitude,
        finishLatitude: routeTo.params.finishLatitude,
        finishLongitude: routeTo.params.finishLongitude,
        radius: routeTo.params.radius
      }
      //console.log(findInfo)
      let drivers = await httpRequest(requestType.get, "api/Ride/FindDrivers", rideRequest, false);
      console.log(drivers)
      for (var i = 0; i < drivers.length; i++) {
        if(drivers[i].PriceForRoute < 0 || drivers[i].PriceForRoute == null)
        {
          drivers[i].PriceForRoute = "Deal";
          drivers[i]["EstimatedPrice"] = -1;
        }
        else
        {
          let price = Math.round(drivers[i].PriceForRoute);
          drivers[i].PriceForRoute = "€ " + price;
          drivers[i]["EstimatedPrice"] = price;
        }
      }
        resolve(
          {
            componentUrl: './pages/passenger/driverslist.html',
          },
          {
            context: {
              drivers: drivers
            }
          }
        );
    }
  },
  {
    path: '/catalog/',
    async: async function(routeTo, routeFrom, resolve, reject){
      var router = this;
      var app = router.app;
      let rides = await httpRequest(requestType.get, "api/Ride/GetAllRides", null);
      
      resolve(
          {
            componentUrl: './pages/shared/catalog.html',
          },
          {
            context: {
              rides: rides
            }
          }
        );
    }
  },
  {
    path: '/settings/',
    url: './pages/shared/profile.html',
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
