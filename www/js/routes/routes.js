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
        radius: routeTo.params.radius/*,
        finishLatitude: routeTo.params.finishLatitude,
        finishLongitude: routeTo.params.finishLongitude*/
      }
      //console.log(findInfo)
      let drivers = await httpRequest(requestType.get, "api/Ride/FindDrivers", rideRequest, false);

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
