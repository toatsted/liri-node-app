require("dotenv").config();

let keys = require("./keys.js");
let request = require("request-promise");
let Twitter = require("twitter");
let Spotify = require("node-spotify-api");
let fs = require("fs-extra");

let mainArg = process.argv[2];
let args = process.argv.slice(3);

function searchMovie(name){
	request(`http://www.omdbapi.com/?apikey=trilogy&t=${name}`)
		.then(response => {
			response = JSON.parse(response);
			for(let key in response){
				if(["Title", "Year", "Country", "Language", "Plot", "Actors"]
					.indexOf(key) > -1){
					console.log(`${key} : ${response[key]}`);
				}
				else if(key === "Ratings"){
					response[key].forEach(value => {
						if(value.Source === "Rotten Tomatoes")
							console.log(`${value.Source} Rating : ${value.Value}`);
					})
				}
				else if(key === "imdbRating")
					console.log(`IMDB Rating : ${response[key]}`)
			}

		})
		.catch(err => console.log(err));
}

function searchSong(name){
	let spotify = new Spotify(keys.spotify);
	 
	spotify.search({ type: 'track', query: name })
		.then(data => {
			let song = data.tracks.items[0];

			let artists = [];
			song.artists.forEach(value => artists.push(value.name));

			console.log(`Name : ${song.name}`);
			console.log(`Album : ${song.album.name}`);
			console.log(`Artists : ${artists.join(", ")}`);
			console.log((song.preview_url === null) ? "" : `Preview : ${song.preview_url}`);

		})
		.catch(err => console.log(err))
}

switch(mainArg){
	case "movie-this":
	case "-m":
		let movie = (args.length === 0) ? "mr nobody" : args.join(" ");
		searchMovie(movie);	
	break;

	case "spotify-this-song":
	case "-s":
		let song = (args.length === 0) ? "the sign ace of base" : args.join(" ");
		searchSong(song);
	break;

	case "my-tweets":
	case "-t":
	break;

	case "do-what-it-says":
	case "-d":
		fs.readFile("./random.txt", "utf8")
			.then(data => searchSong(data))
			.catch(err => console.log(err))
	break;

	default:
		console.log(`
			-m movie-this
			-s spotify-this-song
			-t my-tweets
			-d do-what-it-says		
		`);
	break;
}
