class UserController
{
	constructor(app) {
		this.app = app;
		this.userRepository = new UserRepository();
		this.handleAuthStateChanged();
		
	}

	handleSettingsPage() {
		//console.log(this.user.name)
		//$$(document).on('page:init', '.page[data-name="profile"]', function (e) {
		  	$$("#user-info .name").html(this.user.FullName);
		  	$$("#user-info .username").html(this.user.Email);
		  	$$("#user-info .usertype").html(this.user.UserType);
		  	//console.log("1232131")
		//});
	}

	async handleLoginPopup() {
		console.log("handleLoginPopup")
		let user = new User();
		
		user.email = $$('#login-screen [name="email"]').val();
		user.password = $$('#login-screen [name="password"]').val();
		await this.userRepository.signIn(user);
		this.handleAuthStateChanged();
	}

	handleRegisterPopup(){
		this.app.popup.close($$("#login-screen"), false);
		let registerScreen = $$("#register-screen");
		this.app.popup.open(registerScreen, false);
		let registerScreenRegisterButton = $$("#register-screen .register-button");
		registerScreenRegisterButton.on("click", async () => {
			let user = new User(
					$$('#register-screen [name="fullname"]').val(),
					$$('#register-screen [name="email"]').val(),
					$$('#register-screen [name="password"]').val(),
					$$('#register-screen [name="passwordConfirm"]').val(),
					$$('#register-screen [name="usertype"]:checked').val()
				);
			console.log(user)
			await this.userRepository.register(user);
			await this.userRepository.signIn(user);
			this.handleAuthStateChanged();
			console.log('this.userRepository.register(user);')
		});
	}

	async handleAuthStateChanged() {
		
		let userLoggedIn = false;
		let accessToken = localStorage.getItem(tokenKey);
		if(accessToken != undefined)
		{
			let accessTokenExpirationDate = localStorage.getItem(tokenKeyExpirationDate);
			if(new Date() < new Date(accessTokenExpirationDate))
			{
				userLoggedIn = true;
			}
		}
		console.log(userLoggedIn)
		if(!userLoggedIn){
			app.popup.open($$("#login-screen"), false);
			$$("#login-screen .login-button").on("click", () => this.handleLoginPopup());
			$$("#login-screen .register-popup-link").on("click", ()=> this.handleRegisterPopup());
		}
		else {
			app.popup.close($$("#login-screen"), false);
			app.popup.close($$("#register-screen"), false);
			let data = await httpRequest(requestType.get, "api/Account/UserInfo", null);
			//console.log(data)
			this.user = data; //new User();
			//console.log(this.user.name)
			//Object.assign(this.user, data);
			//console.log(this.user.email)
			this.handleSettingsPage();
			if(data.UserType == "passenger") {
				this.loadPassengerPage();
			} else {
				this.loadDriverPage();
			}

			$$("#user-info .logout").on("click", () => this.logout());
		}
	}

	async logout() {
		let logoutData = await httpRequest(requestType.post, "api/Account/Logout", null, false);
		console.log(logoutData);
		localStorage.removeItem(tokenKey);
        localStorage.removeItem(tokenKeyExpirationDate);
        //this.app.router.navigate({ name: '/' });
        this.handleAuthStateChanged();
        location.reload();
	}

	loadPassengerPage() {
		$$("#passenger-page").show();
		$$("#passenger-page .find").on("click", async ()=>{
			let startLocation = $$("#passenger-page .start").val().split(',');
			let finishLocation = $$("#passenger-page .finish").val().split(',');
			this.rideRequest = {
		        startLatitude: startLocation[0],
		        startLongitude: startLocation[1],
		        finishLatitude: finishLocation[0],
		        finishLongitude: finishLocation[1]
		      }
			homeView.router.navigate(`/driverslist/${startLocation[0]}/${startLocation[1]}/${finishLocation[0]}/${finishLocation[1]}/`);
		});
	}

	loadDriverPage() {
		$$("#driver-page").show();
		this.startLocationTracking();
	}

	startLocationTracking() {
		console.log("startLocationTracking")
		 if (navigator.geolocation) {
		 	console.log("navigator.geolocation")
			//setInterval(()=> {
				console.log("setInterval")
				navigator.geolocation.getCurrentPosition(async position=>{
					let pos = {
						longitude: position.coords.longitude,
						latitude: position.coords.latitude
					};

					let status = await httpRequest(requestType.get, "api/Ride/UpdatePosition", pos, false);
					console.log(status);
				});
				
			//}, 60000);
		}
	}

	async SendRequest(driverId){
		//this.innerText("Request sent!");
		this.rideRequest["driverId"] = driverId;
		console.log(this.rideRequest)
		let status = await httpRequest(requestType.post, "api/Ride/SendRequest", this.rideRequest);
	
		homeView.router.navigate(`/driverslist/${this.rideRequest.startLatitude}/${this.rideRequest.startLongitude}/${this.rideRequest.finishLatitude}/${this.rideRequest.finishLongitude}/`);
	}


}