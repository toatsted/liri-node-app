require("dotenv").config();
let keys = require("./keys.js");
let request = require("request-promise");
let Twitter = require("twitter");
let Spotify = require("node-spotify-api");
let fs = require("fs-extra");
let inquirer = require("inquirer");
let opn = require("opn");

function getTweets() {
	let twitter = new Twitter(keys.twitter);

	let params = {
		screen_name: "yesandbutno",
		count: 20,
	}
	twitter.get("statuses/user_timeline", params)
		.then(tweets => {
			tweets.forEach(value => {
				console.log(value.created_at + "\n" + value.text + "\n");
			})
		})
		.catch(err => console.log(err))
}

function searchMovie(name) {
	let end = [];
	request(`http://www.omdbapi.com/?apikey=trilogy&t=${name}`)
		.then(response => {
			response = JSON.parse(response);
			for (let key in response) {
				if (["Title", "Year", "Country", "Language", "Plot", "Actors"]
					.indexOf(key) > -1) {
					end.push(`${key} : ${response[key]}`);
				} else if (key === "Ratings") {
					response[key].forEach(value => {
						if (value.Source === "Rotten Tomatoes")
							end.push(`${value.Source} Rating : ${value.Value}`);
					})
				} else if (key === "imdbRating")
					end.push(`IMDB Rating : ${response[key]}`)

			}
			console.log(end.join("\n"));
		})
		.catch(err => console.log(err));
}

function searchSong(name) {
	let spotify = new Spotify(keys.spotify);
	let end = [];

	spotify.search({ type: 'track', query: name })
		.then(data => {
			let song = data.tracks.items[0];
			let artists = [];
			song.artists.forEach(value => artists.push(value.name));
			end.push(`Name: ${song.name}`);
			end.push(`Album : ${song.album.name}`);
			end.push(`Artists : ${artists.join(", ")}`);
			console.log(end.join("\n"));
			if (song.preview_url) {
				inquirer.prompt([{
						name: "preview",
						type: "confirm",
						message: "Open preview?",
						default: false,
					}])
					.then(confirm => { if (confirm.preview) opn(song.preview_url) })
					.catch(err => console.log(err))
			}
		})
		.catch(err => console.log(err))
}
console.log();

// if theres arguments, use those
if (process.argv.length > 2) {
	let mainArg = process.argv[2];
	let args = (process.argv.length === 2) ? [] : process.argv.slice(3);
	switch (mainArg) {
		case "do-what-it-says":
		case "-d":
			fs.readFile("./random.txt", "utf8")
				.then(data => searchSong(data))
				.catch(err => console.log(err))
			break;
		case "my-tweets":
		case "-t":
			getTweets();
			break;
		case "spotify-this-song":
		case "-s":
			searchSong((args.length === 0) ? "the sign ace of base" : args);
			break;
		case "movie-this":
		case "-m":
			searchMovie((args.length === 0) ? "mr nobody" : args.join(" "));
			break;
		default:
			// output help screen
			console.log(`
				You can use an interface if you call 'node liri',
				Otherwise you can use the list below to run the app 

				Avalible commands:
				-d    do-what-it-says
				-t    my-tweets
				-s    spotify-this-song
				-m    movie-this
			`);
			break;
	}
	// if no arguments, use inquirer
} else {
	inquirer.prompt([{
			name: "mainArg",
			type: "list",
			message: "Menu",
			choices: ["movie-this", "spotify-this-song", "my-tweets", "do-what-it-says"]
		}])
		.then(response => {
			console.log();
			if (response.mainArg === "do-what-it-says" ||
				response.mainArg === "my-tweets") {
				switch (response.mainArg) {
					case "my-tweets":
						getTweets();
						break;

					case "do-what-it-says":
						fs.readFile("./random.txt", "utf8")
							.then(data => searchSong(data))
							.catch(err => console.log(err))
						break;
				}
			} else {
				inquirer.prompt([{
						name: "args",
						type: "input",
						message: "Search",
					}])
					.then(name => {
						console.log("\n\n");
						switch (response.mainArg) {
							case "movie-this":
								searchMovie((name.args.length === 0) ? "mr nobody" : name.args);
								break;

							case "spotify-this-song":
								searchSong((name.args.length === 0) ? "the sign ace of base" : name.args);
								break;
						}
					})
					.catch(err => console.log(err))
			}
		})
		.catch(err => console.log(err))
}