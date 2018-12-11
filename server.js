const express = require('express');
const request = require('request');
const hbs = require('hbs');
const bodyParser = require('body-parser');


var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

hbs.registerPartials(__dirname+'/views/partials');
app.set('view engine','hbs')


app.get('/', (request, response) => {
    response.send('<h1>Hello!</h1>');
});


app.get('/fetch', (request, response) => {
    response.render('fetch.hbs',{
		title:"Fetch Page",
		pagename:"Fetch Page",
		year: new Date().getFullYear()
	});	
});

app.post('/fetch',function(request,response){
	var keyword = request.body.fetch;
	fetchimg((errorMessage, results) => {
		if (errorMessage){
			console.log(errorMessage);
		} else {
			img = results.img;
			response.send(img);
		}
	}); 
});


app.get('/weather', (request, response) => {
    response.render('weather.hbs',{
		title:"weather Page",
		pagename:"Weather Page",
		year: new Date().getFullYear()
	});	
});

app.post('/weather',function(request,response){
	var location = request.body.location
	getWeather(location,(errorMessage, results) => {
		if (errorMessage){
			console.log(errorMessage);
		} else {
			weather = results.summary;
			temperature = results.temperature;
			address = results.address;

			response.send('The current weather of '+address+' is:'+weather+' with temperature of '+ temperature)
		}
	}); 
});



var getWeather = (address, callback) => {
    var address = request({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAtQ-MeigubB1_OqzVpz-5HEvSytmjePcs&address='
        +encodeURIComponent(address),
        json: true
    }, (error, response, body) => {
        if (error) {
            callback('Cannot connect to Google Maps');
        } else if (body.status == 'ZERO_RESULTS') {
            callback('Cannot find requested address');
        } else if (body.status == 'OK') {
            var lat = body.results[0].geometry.location.lat,
                lng = body.results[0].geometry.location.lng,
                addr = body.results[0].formatted_address;
            request({
                url: 'https://api.darksky.net/forecast/2fc089cc27f8e7e754f6697ee6522f1b/' + lat + ',' + lng,
                json: true
            }, (error, response, body) => {
                callback(undefined, {
                    address: addr,
                    temperature: body.currently.temperature,
                    summary: body.currently.summary
                });
            });
        }
    });
};

var fetchimg = (callback)=>{
	var fetch = request({
		//url:'https://pixabay.com/api/?key=10969107-9c242d8d1bedd2bd2d811fb1d&q='+encodeURIComponent(keyword)+'&image_type=photo',
		url:'https://pixabay.com/api/?key=10969107-9c242d8d1bedd2bd2d811fb1d&q=yellow+flowers&image_type=photo',
		json:true
	},(error,response,body)=>{
		if(error){
			callback('Cannot connect to pixabay');
		}else if (body.status =='ZERO_RESULTS'){
			callback('Cannot find the requested image')
		}else if(body.status=='OK'){
			console.log(body);
			callback(undefined,{
				img:body.hits.largeImageURL
			})
		}
	});
};



app.listen(8080,() =>{
	console.log('Server is up on the port 8080');
});