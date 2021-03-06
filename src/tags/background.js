/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * portions extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

 // Control Node definitions

XSeen.Tags.background = {
	'_changeAttribute'	: function (e, attributeName, value) {
			console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			if (value !== null) {
				e._xseen.attributes[attributeName] = value;
				if (attributeName == 'skycolor') {				// Different operation for each attribute
					e._xseen.sceneInfo.SCENE.background = new THREE.Color(value);

				} else if (attributeName.substr(0,3) == 'src') {
					XSeen.Tags.background._loadBackground (e._xseen.attributes, e);
					
				} else {
					XSeen.LogWarn('No support for updating ' + attributeName);
				}
			} else {
				XSeen.LogWarn("Reparse of " + attributeName + " is invalid -- no change")
			}
		},

	'init'	: function (e, p) 
		{
			e._xseen.sceneInfo.SCENE.background = new THREE.Color(e._xseen.attributes.skycolor);
			XSeen.Tags.background._loadBackground (e._xseen.attributes, e);
		},
			
	'_loadBackground'	: function (attributes, e)
		{
			// Parse src as a default to srcXXX.
			var urls = [];
			var sides = ['right', 'left', 'top', 'bottom', 'front', 'back'];
			var src = attributes.src.split('*');
			var tail = src[src.length-1];
			var srcFile = src[0];
			var urls2load = 0;
			for (var ii=0;  ii<sides.length; ii++) {
				urls[sides[ii]] = srcFile + sides[ii] + tail;
				urls[sides[ii]] = (attributes['src'+sides[ii]] != '') ? attributes['src'+sides[ii]] : urls[sides[ii]];
				if (urls[sides[ii]] == '' || urls[sides[ii]] == sides[ii]) {
					urls[sides[ii]] = null;
				} else {
					urls2load ++;
				}
			}

			if (urls2load > 0) {
				var dirtyFlag;
				XSeen.Loader.TextureCube ('./', [urls['right'],
												 urls['left'],
												 urls['top'],
												 urls['bottom'],
												 urls['front'],
												 urls['back']], '', XSeen.Tags.background.loadSuccess({'e':e}));
			}
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	'loadSuccess' : function (userdata)
		{
			var thisEle = userdata.e;
			return function (textureCube)
			{
				thisEle._xseen.processedUrl = true;
				thisEle._xseen.loadTexture = textureCube;
				thisEle._xseen.sceneInfo.SCENE.background = textureCube;
				console.log ('Successful load of background textures.');
			}
		},
	'loadProgress' : function (a)
		{
			console.log ('Loading background textures...');
		},
	'loadFailure' : function (a)
		{
			//a._xseen.processedUrl = false;
			console.log ('Load failure');
			console.log ('Failure to load background textures.');
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'background',
						'init'	: XSeen.Tags.background.init,
						'fin'	: XSeen.Tags.background.fin,
						'event'	: XSeen.Tags.background.event,
						'tick'	: XSeen.Tags.background.tick
						})
		.defineAttribute ({'name':'skycolor', dataType:'color', 'defaultValue':'black'})
		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcfront', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcback', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcleft', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcright', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srctop', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcbottom', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'backgroundiscube', dataType:'boolean', 'defaultValue':true})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.background._changeAttribute}]})
		.addTag();
