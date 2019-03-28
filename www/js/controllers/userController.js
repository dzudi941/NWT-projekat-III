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
		  	let rideDiscountNumberElem = $$("#user-info .ride-discount-number-input");
		  	if(this.user.UserType == "driver")
		  	{
		  		rideDiscountNumberElem.val(this.user.RideDiscountNumber);
		  		$$("#user-info .ride-discount-number-save").on("click", async () => {
		  			console.log("rideDiscountNumberElem")
		  			let rideDiscountNumber =  rideDiscountNumberElem.val();
		  			let rideDUData = await httpRequest(requestType.get, "api/Account/UpdateRideDiscountNumber", { rideDiscountNumber: rideDiscountNumber }, false);
					console.log(rideDUData);
		  		});
		  	}
		  	else
		  		$$("#user-info .ride-discount-number").hide();
		  	$$("#user-info .rating").html(this.user.Rating);
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

		this.startRideRequestChecking();
	}

	async startRideRequestChecking(){
		setInterval(async ()=> {
			let acceptedRide = await httpRequest(requestType.get, "api/Ride/CurrentRide", null);
			//if(acceptedRide != null)
			//{
				//this.app.dialog.alert(`Congratulations! Driver:${acceptedRide.DriverName} accepted your ride request!`, "Request accepted!");
				this.showCurrentRide(acceptedRide, "passenger");
			//}
		}, 1000);
	}

	async showCurrentRide(currentRide, usertype) {
		//let currentRide = await httpRequest(requestType.get, "api/Ride/CheckIfRideIsAccepted", null);
		let htmlString = "";
		if(currentRide != null)
		{
			htmlString = `
			<div class="block block-strong">
				<p>Current ride!</p>
				<p><b>Driver: </b>${currentRide.DriverName}</p>
				<p><b>Passenger: </b>${currentRide.PassengerName}</p>
				<p><b>Start location: </b>${currentRide.StartLatitude}, ${currentRide.StartLongitude}</p>
				<p><b>Finish location: </b>${currentRide.FinishLatitude}, ${currentRide.FinishLongitude}</p>
			</div>
			<div class="block block-strong">
				<p class="row">
				  <a href="#" onclick="userController.finishRide(${currentRide.Id}, '${usertype}', '${currentRide.ExtraMessage}')" class="col button">Finish ride</a>
				</p>
			</div>`
		}

		$$("#current-ride").html(htmlString);
	}

	loadDriverPage() {
		$$("#driver-page").show();
		this.startLocationTracking();
	}

	startLocationTracking() {
		console.log("startLocationTracking")
		 if (navigator.geolocation) {
		 	console.log("navigator.geolocation")
			setInterval(()=> {
				console.log("setInterval")
				navigator.geolocation.getCurrentPosition(async position=>{
					let pos = {
						longitude: position.coords.longitude,
						latitude: position.coords.latitude
					};

					await httpRequest(requestType.get, "api/Ride/UpdatePosition", pos, false);
					this.showAllRequests();
					let currentRide = await httpRequest(requestType.get, "api/Ride/CurrentRide", null);
					//if(currentRide != null)
					//{	
						this.showCurrentRide(currentRide, "driver");
					//}
				});
				
			}, 1000);
		}
	}

	async showAllRequests() {
		let rideRequests = await httpRequest(requestType.get, "api/Ride/GetRideRequests", null);
		let htmlString = "";
		//console.log(rideRequests);
		for (var i = 0; i < rideRequests.length; i++) {
			htmlString += `
			<div class="block block-strong">
				<p>You have new Ride request!</p>
				<p><b>User: </b>${rideRequests[i].PassengerName}</p>
				<p><b>Start location: </b>${rideRequests[i].StartLatitude}, ${rideRequests[i].StartLongitude}</p>
				<p><b>Finish location: </b>${rideRequests[i].FinishLatitude}, ${rideRequests[i].FinishLongitude}</p>
			</div>
			<div class="block block-strong">
				<p class="row">
				  <a href="#" onclick="userController.acceptRide(${rideRequests[i].Id})" class="col button">Accept</a>
				</p>
			</div>`;
		}

		$$("#driver-page").html(htmlString);
	}

	async acceptRide(rideId) {
		let status = await httpRequest(requestType.get, "api/Ride/AcceptRide", {rideId: rideId}, false);
		console.log(status);
		this.showAllRequests();
	}

	async SendRequest(driverId){
		//this.innerText("Request sent!");
		this.rideRequest["driverId"] = driverId;
		console.log(this.rideRequest)
		let status = await httpRequest(requestType.post, "api/Ride/SendRequest", this.rideRequest);
	
		homeView.router.navigate(`/driverslist/${this.rideRequest.startLatitude}/${this.rideRequest.startLongitude}/${this.rideRequest.finishLatitude}/${this.rideRequest.finishLongitude}/`);
	}

	finishRide(rideId, usertype, extraMessage){
		extraMessage += extraMessage != "" ? "<br>" : "";
		this.app.dialog.prompt(extraMessage + "Rate this ride from 1 to 5 stars", "Rating", 
		async (value) => {
			let finishData = {
				rideId: rideId,
				rating: value,
				usertype: usertype
			}
			let status = await httpRequest(requestType.get, "api/Ride/FinishRide", finishData, false);
			console.log(status);
		}, 
		() => {
			console.log("canceled");
		}, 
		5);

		
	}
}