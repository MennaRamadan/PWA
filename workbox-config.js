module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{html,ico,json,css,js}',
		"src/images/*.{jpg,png}"
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	"globIgnores": [
		"help/**",
		"../workbox-cli-config.js"
	],
	swDest: 'public/service-workers.js',
	// swSrc: "public/sw-base.js"
};