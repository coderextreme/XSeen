/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realism, Los Angeles
 * Some pieces may be
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 *
 *	0.6.2: Fixed Camera and navigation bug
 *	0.6.3: Added Plane and Ring
 *	0.6.4: Fixed size determination bug
 *	0.6.5: Added Fog
 *	0.6.6: Added Metadata [Release]
 *	0.6.7: Added tknot (torus knot)
 *	0.6.8: Added PBR
 *	0.6.9: Preliminary fix for display size
 *	0.6.10: Fix for background urls not present
 *	0.6.11: Created common routine for loading texture cubes - fixed envMap for PBR.
 *	0.6.12: Simple animation (no way-points)
 *	0.6.13: Way point animation
 *	0.6.14: Mouse event creation
 *	0.6.15: Rotation animation
 *	0.6.16: Added Label tag
 *	0.6.17: Fixed a number of issues - asynchronous model loading, group, scene loading, camera
 *	0.6.18: Allowed user identified non-selectable geometry
 *
 *	Additional PBR
 *	Fix for style3d (see embedded TODO)
 *	Audio
 *	Editor
 *	Events (add events as needed)
 *	Labeling (add space positioning)
 * 
 */

var Renderer = new THREE.WebGLRenderer();

XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;
XSeen.Constants = {
					'_Major'		: 0,
					'_Minor'		: 6,
					'_Patch'		: 18,
					'_PreRelease'	: 'alpha.1',
					'_Release'		: 6,
					'_Version'		: '',
					'_RDate'		: '2017-04-12',
					'_SplashText'	: ["XSeen 3D Language parser.", "XSeen <a href='http://xseen.org/index.php/documentation/' target='_blank'>Documentation</a>."],
					'tagPrefix'		: 'x-',
					'rootTag'		: 'scene',
					};
XSeen.CONST = XSeen.DefineConstants();
XSeen.Time =  {
					'start'		: (new Date()).getTime(),
					'now'		: (new Date()).getTime(),
				};
// Using the scheme at http://semver.org/
XSeen.Version = {
			'major'			: XSeen.Constants._Major,
			'minor'			: XSeen.Constants._Minor,
			'patch'			: XSeen.Constants._Patch,
			'preRelease'	: XSeen.Constants._PreRelease,
			'release'		: XSeen.Constants._Release,
			'version'		: XSeen.Constants._Major + '.' + XSeen.Constants._Minor + '.' + XSeen.Constants._Patch,
			'date'			: XSeen.Constants._RDate,
			'splashText'	: XSeen.Constants._SplashText,
			};
XSeen.Version.version += (XSeen.Version.preRelease != '') ? '-' + XSeen.Version.preRelease : '';
XSeen.Version.version += (XSeen.Version.release != '') ? '+' + XSeen.Version.release : '';

// Holds the list of onLoad callbacks
if (typeof(XSeen.onLoadCallBack) === 'undefined') {
	XSeen.onLoadCallBack = [];
}

// Holds all of the parsing information
XSeen.parseTable = [];

// Data object for Runtime
// Stereo viewing effect from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
var StereoRenderer = new THREE.StereoEffect(Renderer);
XSeen.Runtime = {
			'currentTime'			: 0,			// Current time at start of frame rendering
			'deltaTime'				: 0,			// Time since last frame
			'frameNumber'			: 0,			// Number of frame about to be rendered
			'Time'					: new THREE.Clock(),
			'Renderer'				: Renderer,
			'RendererStandard'		: Renderer,
			'RendererStereo'		: StereoRenderer,
			'Camera'				: {},
			'CameraControl'			: {},			// Camera control to be used in Renderer for various types
			'Mixers'				: [],			// Internal animation mixer array
			'perFrame'				: [],			// List of methods with data to execute per frame
			'Animate'				: function() {	// XSeen animation loop control
										//console.log ('Rendering loop, isStereographic: ' + XSeen.Runtime.isStereographic);
										if (XSeen.Runtime.isStereographic) {
											requestAnimationFrame (XSeen.Runtime.Animate);
											XSeen.RenderFrame();
										} else {
											XSeen.Runtime.Renderer.animate (XSeen.RenderFrame);
										}
									},
			'TweenGroups'			: [],
			'Resize'				: function () {
										if (!XSeen.Runtime.isStereographic) {
											XSeen.Runtime.Size = XSeen.updateDisplaySize (XSeen.Runtime.RootTag);
											XSeen.Runtime.Camera.aspect = XSeen.Runtime.Size.width / XSeen.Runtime.Size.height;
											XSeen.Runtime.Camera.updateProjectionMatrix();
											XSeen.Runtime.Renderer.setSize (XSeen.Runtime.Size.width, XSeen.Runtime.Size.height)
										}
									},
			'rulesets'				: [],			// Style ruleset array structure
			'StyleRules'			: {				// Collection of style rulesets
				'ruleset'	: [],					// Specific ruleset
				'idLookup'	: []	},				// Cross-reference into 'rulesets' by 'id'
			'selectable'			: [],			// Selectable geometry elements
			'isVrCapable'			: false,		// WebVR ready to run && access to VR device 
			'hasDeviceOrientation'	: false,		// device has Orientation sensor
			'hasVrImmersive'		: false,		// hasDeviceOrientation && stereographic capable (=== TRUE)
			'isStereographic'		: false,		// currently running stereographic display (not VR)
			'rendererHasControls'	: false,		// Renderer has built-in motion controls
			'isProcessingResize'	: false,		// semaphore for resizing processing
			};										// Need place-holder for xR scene (if any -- tbd)
			
XSeen.RenderFrame = function()
	{
		if (XSeen.Runtime.isProcessingResize) {return;}		// Only do one thing at a time

		if (XSeen.Runtime.frameNumber == 0) {
			if (XSeen.Loader.loadingComplete()) {
				XSeen.Tags.scene.addScene();
			} else {
				return;
			}
		}
		XSeen.Runtime.deltaTime = XSeen.Runtime.Time.getDelta();
		XSeen.Runtime.currentTime = XSeen.Runtime.Time.getElapsedTime();
		XSeen.Runtime.frameNumber ++;

		var newEv = new CustomEvent('xseen', XSeen.Events.propertiesRenderFrame(XSeen.Runtime));
		XSeen.Runtime.RootTag.dispatchEvent(newEv);
		
/*
 *	Do various subsystem updates. Order is potentially important. 
 *	First position/orient camera & frame size so any calculations done on that use the new position
 *	Mixes handle internal (within model) animations
 *	Tween handles user-requested (in code) animations
 */
		XSeen.Update.Camera (XSeen.Runtime);
		XSeen.Update.Mixers (XSeen.Runtime);
		XSeen.Update.Tween (XSeen.Runtime);
		if (XSeen.Runtime.frameNumber > 1) XSeen.Update.Ticks (XSeen.Runtime);

		XSeen.Runtime.Renderer.render( XSeen.Runtime.SCENE, XSeen.Runtime.Camera );
	};
	
XSeen.Update = {
	'Tween'		: function (Runtime)
		{
			TWEEN.update();
			if (typeof(Runtime.TweenGroups) != 'undefined') {
				for (var ii=0; ii<Runtime.TweenGroups.length; ii++) {
					Runtime.TweenGroups[ii].update();
				}
			}
		},
	'Mixers'	: function (Runtime)
		{
			if (typeof(Runtime.Mixers) === 'undefined') return;
			for (var i=0; i<Runtime.Mixers.length; i++) {
				Runtime.Mixers[i].update(Runtime.deltaTime);
			}
		},
	'Ticks'		: function (Runtime)
		{
			for (var i=0; i<Runtime.perFrame.length; i++) {
				Runtime.perFrame[i].method (Runtime, Runtime.perFrame[i].userdata);
			}

		},
	'Camera'	: function (Runtime)
		{
			if (!Runtime.rendererHasControls) {
				Runtime.CameraControl.update();
			}
		},
	}

// Run the 'onLoad' method when the page is fully loaded
window.document.addEventListener('DOMContentLoaded', XSeen.onLoad);
