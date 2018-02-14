let restaurant;
var map;


document.addEventListener('DOMContentLoaded', (event) => {
	handleOffline();
});

/** Handle offline case
 * */
handleOffline = () => {
	if (!navigator.onLine) {
		fetchRestaurantFromURL((error, restaurant) => {
			if (error) { // Got an error!
				console.error(error);
			} else {
				fillBreadcrumb();
			}
		});
		
		// Hide the map
		document.querySelector('#map-container').style.display = "none";
	}
};


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
		}
	});
}


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant)
		return;
	}
	const id = getParameterByName('id');
	if (!id) { // no id found in URL
		error = 'No restaurant id in URL';
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;
			if (!restaurant) {
				console.error(error);
				return;
			}
			fillRestaurantHTML();
			focusOnTheHomeNav(); // This is where user could go back to the home page
			callback(null, restaurant)
		});
	}
};

/**
 * Focus on the home nav item to so user could go back to the home page.
 * This is the only clickable item on this page anyway (exclude the map)
 * */

focusOnTheHomeNav = () => {
	const $homeNav = document.querySelector('.home-nav');
	$homeNav.focus();
	
	// We set 1, not 0, because we want to bypass the map, so we could move from
	// the navigation, to the restaurant details below.
	// If we set 0, it will take the map into account the map.
	$homeNav.setAttribute('tabIndex', 1)
	
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;
	name.setAttribute('tabIndex', 1);

	const address = document.getElementById('restaurant-address');
	address.innerHTML = restaurant.address;
	address.setAttribute('tabIndex', 1);
	
	const image = document.getElementById('restaurant-img');
	image.className = 'restaurant-img';
	image.alt = `${restaurant.name} restaurant photo`;
	image.src = DBHelper.imageUrlForRestaurant(restaurant);

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = restaurant.cuisine_type;
	

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');
	for (let key in operatingHours) {
		const row = document.createElement('tr');

		const day = document.createElement('td');
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement('td');
		time.innerHTML = operatingHours[key];
		row.appendChild(time);

		hours.appendChild(row);
	}
	hours.setAttribute('tabIndex', 1);
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h3');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	reviews.forEach(review => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {

	const innerHTML = `
				<div class="review-header">
					<p class="review-name">${review.name}</p>
					<p class="review-date">${review.date}</p>
				</div>
				<p class="review-rating">Rating: ${review.rating}</p>
				<p>${review.comments}</p>
			`;

	const li = document.createElement('li');
	li.innerHTML = innerHTML;
	li.setAttribute('role', 'listitem');
	li.setAttribute('tabIndex',1);
	return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
