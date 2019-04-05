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
		  	$$("#user-info .usertype").html(this.user.UserType == 0 ? "Driver" : "Passenger");
		  	
		  	if(this.user.UserType == 0)
		  	{
		  		let rideDiscountNumberElem = $$("#user-info .ride-discount-number-input");

		  		rideDiscountNumberElem.val(this.user.RideDiscountNumber);
		  		console.log("this.user.DiscountInPercentage" + this.user.DiscountInPercentage)
		  		$$("#user-info .ride-discount-percentage").val(this.user.DiscountInPercentage);
		  		$$("#user-info .ride-price-per-km").val(this.user.PriceForRoute == -1 ? "" : this.user.PriceForRoute);
		  		$$("#user-info .ride-discount-number-save").on("click", async () => {
		  			//console.log("rideDiscountNumberElem")
		  			let rideDiscountNumber =  rideDiscountNumberElem.val();
		  			let pricePerKm = $$("#user-info .ride-price-per-km").val();
		  			pricePerKm = pricePerKm == "" ? -1 : pricePerKm;
		  			let discountInPercentage = $$("#user-info .ride-discount-percentage").val();
		  			let rideDUData = await httpRequest(requestType.get, "api/Account/UpdateDriverSettings", { rideDiscountNumber: rideDiscountNumber, pricePerKm: pricePerKm, discountInPercentage: discountInPercentage }, false);
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
			let usertype = $$('#register-screen [name="usertype"]:checked').val();
			let usrT = usertype == "driver" ? 0 : 1;
			let user = new User(
					$$('#register-screen [name="fullname"]').val(),
					$$('#register-screen [name="email"]').val(),
					$$('#register-screen [name="password"]').val(),
					$$('#register-screen [name="passwordConfirm"]').val(),
					usrT
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
			if(data.UserType == 1) {
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
			let radius = $$("#passenger-page .radius").val();
			this.rideRequest = {
		        startLatitude: startLocation[0],
		        startLongitude: startLocation[1],
		        finishLatitude: finishLocation[0],
		        finishLongitude: finishLocation[1]
		      }
			homeView.router.navigate(`/driverslist/${startLocation[0]}/${startLocation[1]}/${finishLocation[0]}/${finishLocation[1]}/${radius}`);
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

			let pendingRideRequest = await httpRequest(requestType.get, "api/Ride/PendingRideRequest", null);
			if(pendingRideRequest != null) this.showPendingRideRequest(pendingRideRequest);
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

	async showPendingRideRequest(currentRide) {
		let htmlString = "";
		if(currentRide != null)
		{
			htmlString = `
			<div class="block block-strong">
				<p>Pending ride request!</p>
				<p><b>Driver: </b>${currentRide.DriverName}</p>
				<p><b>Passenger: </b>${currentRide.PassengerName}</p>
				<p><b>Start location: </b>${currentRide.StartLatitude}, ${currentRide.StartLongitude}</p>
				<p><b>Finish location: </b>${currentRide.FinishLatitude}, ${currentRide.FinishLongitude}</p>
				<p><b>Estimated price: </b>€ ${currentRide.EstimatedPrice}</p>
			</div>
			<div class="block block-strong">
				<p class="row">
				  <a href="#" onclick="userController.declineRide(${currentRide.Id})" class="col button">Cancel request</a>
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
						longitude: /*21.8880453*/position.coords.longitude,
						latitude:  /*43.316019*/position.coords.latitude
					};
					//console.log(pos)

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
				<p><b>Estimated price: </b>€ ${rideRequests[i].EstimatedPrice}</p>
			</div>
			<div class="block block-strong">
				<p class="row">
				  <a href="#" onclick="userController.acceptRide(${rideRequests[i].Id})" class="col button">Accept</a>
				  <a href="#" onclick="userController.declineRide(${rideRequests[i].Id})" class="col button color-red">Decline</a>
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

	async declineRide(rideId) {
		let status = await httpRequest(requestType.get, "api/Ride/DeclineRide", {rideId: rideId}, false);
		console.log(status);
		this.showAllRequests();
	}

	async SendRequest(driverId, estimatedPrice){
		//this.innerText("Request sent!");
		this.rideRequest["driverId"] = driverId;
		this.rideRequest["estimatedPrice"] = estimatedPrice;
		console.log(this.rideRequest)
		let status = await httpRequest(requestType.post, "api/Ride/SendRequest", this.rideRequest);
	
		homeView.router.navigate(`/driverslist/${this.rideRequest.startLatitude}/${this.rideRequest.startLongitude}/${this.rideRequest.finishLatitude}/${this.rideRequest.finishLongitude}/`);
	}

	finishRide(rideId, usertype, extraMessage){
		extraMessage += extraMessage != "" ? "<br>" : "";
		this.app.dialog.prompt(extraMessage + "Rate this ride from 1 to 5 stars", "Rating", 
		async (value) => {
			let usrT = usertype == "driver" ? 0 : 1;
			let finishData = {
				rideId: rideId,
				rating: value,
				usertype: usrT
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