routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    name: 'driverslist',
    path: '/driverslist/:startLatitude/:startLongitude/:finishLatitude/:finishLongitude',
    async: async function (routeTo, routeFrom, resolve, reject) {
      var router = this;

      // App instance
      var app = router.app;

      let rideRequest = {
        startLatitude: routeTo.params.startLatitude,
        startLongitude: routeTo.params.startLongitude,
        finishLatitude: routeTo.params.finishLatitude,
        finishLongitude: routeTo.params.finishLongitude
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
    componentUrl: './pages/catalog.html',
  },
  {
    path: '/product/:id/',
    componentUrl: './pages/product.html',
  },
  {
    path: '/settings/',
    url: './pages/shared/profile.html',
  },
  // Page Loaders & Router
  {
    path: '/page-loader-template7/:user/:userId/:posts/:postId/',
    templateUrl: './pages/page-loader-template7.html',
  },
  {
    path: '/page-loader-component/:user/:userId/:posts/:postId/',
    componentUrl: './pages/page-loader-component.html',
  },
  {
    path: '/request-and-load/user/:userId/',
    async: async function (routeTo, routeFrom, resolve, reject) {
      // Router instance
      var router = this;

      // App instance
      var app = router.app;
      // User ID from request
      var userId = routeTo.params.userId;
      let drivers = await httpRequest(requestType.get, "api/Account/FindDrivers", findInfo, false);
      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            componentUrl: './pages/request-and-load.html',
          },
          {
            context: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
