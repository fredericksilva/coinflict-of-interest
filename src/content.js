const dataCache = new Map();

const getData = async username => {
	const url = `https://hive.one/api/top-people/${username}`;

	const cachedData = dataCache.get(url);
	if (typeof cachedData !== 'undefined') {
		return cachedData;
	}

	const response = await fetch(url);

	if (response.status === 404) {
		dataCache.set(url, false);
		return false;
	}

	const data = await response.json();
	dataCache.set(url, data);
	return data;
};

const preloadTweetData = () => {
	Array.from(document.querySelectorAll('.tweet')).forEach(tweet => {
		if (tweet.dataset.coinbiasPreloaded) {
			return false;
		}

		const username = tweet.dataset.screenName;
		getData(username);

		tweet.dataset.coinbiasPreloaded = true;
	});
};

const injectChart = async () => {
	const profileHoverContainer = document.querySelector('#profile-hover-container');
	const profileCard = profileHoverContainer.querySelector('.profile-card');

	if (!(profileCard && !profileCard.dataset.coinbias)) {
		return;
	}
	profileCard.dataset.coinbias = true;

	const username = profileCard.querySelector('[data-screen-name]').dataset.screenName;
	const data = await getData(username);

	const container = document.createElement('div');
	container.innerHTML = `
	<div class="ProfileCardBias ProfileCardStats">
		<span class="ProfileCardStats-statLabel u-block">Coinbias</span>
	</div>`;
	const biases = container.children[0];

	if (data) {
		biases.appendChild(document.createTextNode(':)'));
	} else {
		biases.appendChild(document.createTextNode('No bias data available for this user.'));
	}

	const profileCardStats = profileCard.querySelector('.ProfileCardStats');
	profileCardStats.parentNode.insertBefore(biases, profileCardStats);

	const gravitySouth = profileCard.classList.contains('gravity-south');
	const offset = gravitySouth ? biases.offsetHeight : 0;
	profileHoverContainer.style.transform = `translateY(-${offset}px)`;
};

observer = new MutationObserver(() => {
	preloadTweetData();
	injectChart();
});
observer.observe(document.body, {childList: true, subtree: true});