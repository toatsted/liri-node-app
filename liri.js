require("dotenv").config();

let kets = require("./keys.js");
let request = require("request-promise");


let mainArg = process.argv[2];
let args = [];
process.argv.forEach((value, index) => {if(index > 2) args.push(value)});


if(mainArg === 'movie-this'){
	request(`http://www.omdbapi.com/?apikey=trilogy&t=${args.join(" ")}`)
		.then(response => {
			response = JSON.parse(response);
			for(let key in response){
				if(["Title", "Year", "imdbRating", "Country",
					"Language", "Plot", "Actors"].indexOf(key) > -1){
					console.log(`${key} : ${response[key]}`);
				}
			}
		})
		.catch(err => console.log(err));
}