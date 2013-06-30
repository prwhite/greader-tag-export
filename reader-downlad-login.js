#!/usr/bin/env node --harmony

"use strict";

var reader = require ( "./node-reader.js" );
var fs = require ( "fs" );
var path = require ( "path" );

var gUser = "";
var gPass = "";
var gTag = "";
var gQuant = 1000;
var gCount = 0;

// help from here:
// https://code.google.com/p/pyrfeed/wiki/GoogleReaderAPI
// http://blog.martindoms.com/2009/10/16/using-the-google-reader-api-part-2/
// https://gist.github.com/dongyuwei/2034195

// not used, but informative:
// https://github.com/rafinskipg/GoogleReader-NodeJS-API

function doOpts ( args )
{
	if ( args.length < 5 )
	{
		console.log ( "args invalid: ", args, args.length );
		console.log ( "usage: argv0 <user> <pass> <tag>" )

		console.log ( " common tags:" );
		console.log ( "  user/-/label/something" );
		console.log ( "  user/-/state/com.google/starred" );

		process.exit ( -1 );
	}

	gUser = args[ 2 ];
	gPass = args[ 3 ];
	gTag = args[ 4 ];
}

function main ( argv )
{
	doOpts ( argv );

	reader.login ( gUser, gPass, function () {
		console.log ( "login succeeded" );
		getItems ( gTag );
	}, function () {
		console.log ( "login failed" );
	});
}

function getItems ( feed, cont )
{
	reader.getItems ( feed, function ( data, response ) {
		let base = path.basename ( gTag );
		let fname = "reader-saved-tag-" + base + "-" + gCount + ".xml";

		console.log ( "getItems succeeded, writing file", fname );

			// data is json or null if getting xml atom feed.
		let out = data ? JSON.stringify ( data, null, 2 ) : response;
		fs.writeFileSync ( fname, out, "utf8" )

			// google json representation... not actually used in this setup.
		let ncont = response.continuation;

			// xml atom feed
		let match = response.match ( /<gr:continuation>(.*?)<\/gr:continuation>/ );

		if ( match )
			ncont = match[ 1 ];

		if ( ncont )
		{
			console.log ( "got continuation: ", ncont );

			gCount += gQuant;

				// Recurse if we got a continuation.
			getItems ( feed, ncont );
		}
	}, { n : gQuant, output : null, c : cont } );
}

main ( process.argv );
