#!/usr/bin/env node --harmony

"use strict";

var reader = require ( "./node-reader.js" );
var fs = require ( "fs" );
var path = require ( "path" );
var clc = require ( "cli-color" );

var gUser = "";
var gPass = "";
var gTag = "";
var gQuant = 1000;
var gFormat = "";
var gCount = 0;

// help from here:
// https://code.google.com/p/pyrfeed/wiki/GoogleReaderAPI
// http://blog.martindoms.com/2009/10/16/using-the-google-reader-api-part-2/
// https://gist.github.com/dongyuwei/2034195
// https://groups.google.com/forum/?fromgroups#!topic/fougrapi/Rab23a9jhzc  (for atom-hifi)

// not used, but informative:
// https://github.com/rafinskipg/GoogleReader-NodeJS-API
// https://github.com/mihaip/readerisdead#reader_archive

function doOpts ( args )
{
	if ( args.length != 6 )
	{
		console.log ( "args invalid: ", args, args.length );
		console.log ( "usage: argv0 <user> <pass> <xml|json> <tag>" )

		console.log ( " common tags:" );
		console.log ( "  user/-/label/something" );
		console.log ( "  user/-/state/com.google/starred" );

		process.exit ( -1 );
	}

	gUser = args[ 2 ];
	gPass = args[ 3 ];
	gFormat = args[ 4 ];
	gTag = args[ 5 ];
}

function main ( argv )
{
	doOpts ( argv );

	reader.login ( gUser, gPass, function () {
		console.log ( clc.green ( "login succeeded" ) );
		getItems ( gTag );
	}, function () {
		console.log ( clc.red ( "login failed" ) );
	});
}

function getItems ( feed, cont )
{
	reader.getItems ( feed, function ( data, response ) {
		let base = path.basename ( gTag );
		let fname = "reader-saved-tag-" + base + "-" + gCount + "." + gFormat;

		console.log ( clc.green ( "getItems succeeded, writing file" ), fname );

			// data is json or null if getting xml atom feed.
		let out = data ? JSON.stringify ( data, null, 2 ) : response;
		fs.writeFileSync ( fname, out, "utf8" )

			// google json representation... not actually used in this setup.
		let ncont = response.continuation;

			// xml atom feed
		let match = response.match ? response.match ( /<gr:continuation>(.*?)<\/gr:continuation>/ ) : null;

		if ( match )
			ncont = match[ 1 ];

		if ( ncont )
		{
			console.log ( clc.cyan ( "got continuation: " ), ncont );

			gCount += gQuant;

				// Recurse if we got a continuation.
			getItems ( feed, ncont );
		}
	}, { n : gQuant, output : gFormat, c : cont } );
}

main ( process.argv );
