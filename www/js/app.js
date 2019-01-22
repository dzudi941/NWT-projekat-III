// Dom7
var $$ = Dom7;

// Framework7 App main instance
var app  = new Framework7({
  root: '#app', // App root element
  id: 'io.framework7.jdrive', // App bundle ID
  name: 'JDrive', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
  data: function () {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
      // Demo products for Catalog section
      products: [
        {
          id: '1',
          title: 'Apple iPhone 8',
          description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
        },
        {
          id: '2',
          title: 'Apple iPhone 8 Plus',
          description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
        },
        {
          id: '3',
          title: 'Apple iPhone X',
          description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
        },
      ]
    };
  },
  // App root methods
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hello World!');
    },
  },
  // App routes
  routes: routes,
});

// Init/Create views
var homeView = app.views.create('#view-home', {
  url: '/'
});
var catalogView = app.views.create('#view-catalog', {
  url: '/catalog/'
});
var settingsView = app.views.create('#view-settings', {
  url: '/settings/'
});

$$(document).on('DOMContentLoaded', function(){
  /*let loginPopupData = {
    el: $$("#login-screen"),
    registerPopupLinkEl: $$("#login-screen .register-popup-link")
  };
  let registerPopupData = {
    el: $$("#register-screen"),
    firstNameEl: $$('#register-screen [name="firstname"]'),
    lastNameEl: $$('#register-screen [name="lastname"]'),
    usernameEl: $$('#register-screen [name="username"]'),
    passwordEl: $$('#register-screen [name="password"]'),
    passwordConfirmEl: $$('#register-screen [name="passwordConfirm"]'),
    userTypeEl: $$('#register-screen [name="usertype"]')
  };*/
  userController = new UserController(app);


});

const apiUrl = "http://localhost:63019/";
const tokenKey = 'accessToken';
const tokenKeyExpirationDate = "tokenKeyExpirationDate";
const requestType = {post: "POST", get: "GET"};

function httpRequest(method, path, data, stringify = true)
{
    //app.request.postJSON(apiUrl + path, JSON.stringify(data), (s)=>{}, (e)=>{});
  return new Promise((resolve, reject) => {
        var token = localStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        let requestSettings = {
            method: method,
            accepts: "application/json",
            url: apiUrl + path,
            contentType: "application/json",
            headers: headers,
            error: function(jqXHR, textStatus, errorThrown) {
              //alert("Something went wrong!");
              reject(textStatus);
            },
            success: function(result) {
              resolve(result != "" ? JSON.parse(result) : result);
            }
        }
        if(data != null) 
        {
            requestSettings["data"] = stringify ? JSON.stringify(data) : data;
        }

        app.request(requestSettings);
    });
}