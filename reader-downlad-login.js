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

	// console.log ( reader );
	reader.login ( gUser, gPass, function () {
		console.log ( "login succeeded" );
		// getItems ( "user/-/label/" + gTag );
		getItems ( gTag );
		// getFeeds ();
	}, function () {
		console.log ( "login failed" );
	});
}

function getItems ( feed, cont )
{
	// let feed = "http://www.google.com/reader/view/?at=zDi1DG3_dL3_FgcS8HR1AQ#stream/user%2F06674516782868565233%2Flabel%2Fmisc";

	reader.getItems ( feed, function ( data, response ) {
		let base = path.basename ( gTag );
		let fname = "reader-saved-tag-" + base + "-" + gCount + ".xml";

		// console.log ( "getItems succeeded: ", JSON.stringify ( arguments, null, 4 ) );
//		console.log ( "getItems succeeded with", data.length, "items, writing file", fname );
		console.log ( "getItems succeeded, writing file", fname );

		// console.log ( "response.self = ", response.self );

		let out = data ? JSON.stringify ( data, null, 2 ) : response;
		fs.writeFileSync ( fname, out, "utf8" )

		let ncont = response.continuation;

		let match = response.match ( /<gr:continuation>(.*?)<\/gr:continuation>/ );

		if ( match )
			ncont = match[ 1 ];

			// json
		if ( ncont )
		{
			console.log ( "got continuation: ", ncont );

			gCount += gQuant;

			getItems ( feed, ncont );
		}
	}, { n : gQuant, output : null, c : cont } );
}

function getFeeds ()
{
	reader.loadFeeds ( function ( feeds ) {
		console.log ( "getFeeds succeeded", feeds );
	});
}

main ( process.argv );
