﻿"use strict";

var JSONParser = function(scene)
{
}

JSONParser.prototype.constructor = JSONParser;

	/**
	 * Load X3D JSON into an element.
	 * jsobj - the JavaScript object to convert to DOM.
	 */
JSONParser.prototype.parseJavaScript = function(jsobj) {
		var child = this.CreateElement('scene');
		this.ConvertToX3DOM(jsobj, "", child);
		// console.log(jsobj, child);
		return child;
	};

	// 'http://www.web3d.org/specifications/x3d-namespace'

	// Load X3D JavaScript object into XML or DOM

	/**
	 * Yet another way to set an attribute on an element.  does not allow you to
	 * set JSON schema or encoding.
	 */
JSONParser.prototype.elementSetAttribute = function(element, key, value) {
		if (key === 'SON schema') {
			// JSON Schema
		} else if (key === 'ncoding') {
			// encoding, UTF-8, UTF-16 or UTF-32
		} else {
			if (typeof element.setAttribute === 'function') {
				element.setAttribute(key, value);
			}
		}
	};

	/**
	 * converts children of object to DOM.
	 */
JSONParser.prototype.ConvertChildren = function(parentkey, object, element) {
		var key;

		for (key in object) {
			if (typeof object[key] === 'object') {
				if (isNaN(parseInt(key))) {
					this.ConvertObject(key, object, element, parentkey.substr(1));
				} else {
					this.ConvertToX3DOM(object[key], key, element, parentkey.substr(1));
				}
			}
		}
	};

	/**
	 * a method to create and element with tagnam key to DOM in a namespace.  If
	 * containerField is set, then the containerField is set in the elemetn.
	 */
JSONParser.prototype.CreateElement = function(key, containerField) {
		var child = document.createElement(key);
		if (typeof containerField !== 'undefined') {
			this.elementSetAttribute(child, 'containerField', containerField);
		}
		return child;
	};

	/**
	 * a way to create a CDATA function or script in HTML, by using a DOM parser.
	 */
JSONParser.prototype.CDATACreateFunction = function(document, element, str) {
		var y = str.replace(/\\"/g, "\\\"")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&");
		do {
			str = y;
			y = str.replace(/'([^'\r\n]*)\n([^']*)'/g, "'$1\\n$2'");
			if (str !== y) {
				console.log("CDATA Replacing",str,"with",y);
			}
		} while (y != str);
		var domParser = new DOMParser();
		var cdataStr = '<script> <![CDATA[ ' + y + ' ]]> </script>'; // has to be wrapped into an element
		var scriptDoc = domParser .parseFromString (cdataStr, 'application/xml');
		var cdata = scriptDoc .children[0] .childNodes[1]; // space after script is childNode[0]
		element .appendChild(cdata);
	};

	/**
	 * convert the object at object[key] to DOM.
	 */
JSONParser.prototype.ConvertObject = function(key, object, element, containerField) {
		var child;
		if (object !== null && typeof object[key] === 'object') {
			if (key.substr(0,1) === '@') {
				this.ConvertToX3DOM(object[key], key, element);
			} else if (key.substr(0,1) === '-') {
				this.ConvertChildren(key, object[key], element);
			} else if (key === '#comment') {
				for (var c in object[key]) {
					child = document.createComment(this.CommentStringToXML(object[key][c]));
					element.appendChild(child);
				}
			} else if (key === '#text') {
				child = document.createTextNode(object[key].join(""));
				element.appendChild(child);
			} else if (key === '#sourceText') {
				this.CDATACreateFunction(document, element, object[key].join("\r\n")+"\r\n");
			} else {
				if (key === 'connect' || key === 'fieldValue' || key === 'field' || key === 'meta' || key === 'component') {
					for (var childkey in object[key]) {  // for each field
						if (typeof object[key][childkey] === 'object') {
							child = this.CreateElement(key, containerField);
							this.ConvertToX3DOM(object[key][childkey], childkey, child);
							element.appendChild(child);
							element.appendChild(document.createTextNode("\n"));
						}
					}
				} else {
					child = this.CreateElement(key, containerField);
					this.ConvertToX3DOM(object[key], key, child);
					element.appendChild(child);
					element.appendChild(document.createTextNode("\n"));
				}
			}
		}
	};

	/**
	 * convert a comment string in JavaScript to XML.  Pass the string
	 */
JSONParser.prototype.CommentStringToXML = function(str) {
		var y = str;
		str = str.replace(/\\\\/g, '\\');
		if (y !== str) {
			console.log("X3DJSONLD <!-> replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * convert an SFString to XML.
	 */
JSONParser.prototype.SFStringToXML = function(str) {
		var y = str;
		/*
		str = (""+str).replace(/\\\\/g, '\\\\');
		str = str.replace(/\\\\\\\\/g, '\\\\');
		str = str.replace(/(\\+)"/g, '\\"');
		*/
		str = str.replace(/\\/g, '\\\\');
		str = str.replace(/"/g, '\\\"');
		if (y !== str) {
			console.log("X3DJSONLD [] replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * convert a JSON String to XML.
	 */
JSONParser.prototype.JSONStringToXML = function(str) {
		var y = str;
		str = str.replace(/\\/g, '\\\\');
		str = str.replace(/\n/g, '\\n');
		if (y !== str) {
			console.log("X3DJSONLD replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * main routine for converting a JavaScript object to DOM.
	 * object is the object to convert.
	 * parentkey is the key of the object in the parent.
	 * element is the parent element.
	 * containerField is a possible containerField.
	 */
JSONParser.prototype.ConvertToX3DOM = function(object, parentkey, element, containerField) {
		var key;
		var localArray = [];
		var isArray = false;
		var arrayOfStrings = false;
		for (key in object) {
			if (isNaN(parseInt(key))) {
				isArray = false;
			} else {
				isArray = true;
			}
			if (isArray) {
				if (typeof object[key] === 'number') {
					localArray.push(object[key]);
				} else if (typeof object[key] === 'string') {
					localArray.push(object[key]);
					arrayOfStrings = true;
				} else if (typeof object[key] === 'boolean') {
					localArray.push(object[key]);
				} else if (typeof object[key] === 'object') {
					/*
					if (object[key] != null && typeof object[key].join === 'function') {
						localArray.push(object[key].join(" "));
					}
					*/
					this.ConvertToX3DOM(object[key], key, element);
				} else if (typeof object[key] === 'undefined') {
				} else {
					console.error("Unknown type found in array "+typeof object[key]);
				}
			} else if (typeof object[key] === 'object') {
				// This is where the whole thing starts
				if (key === 'scene') {
					this.ConvertToX3DOM(object[key], key, element);
				} else {
					this.ConvertObject(key, object, element);
				}
			} else if (typeof object[key] === 'number') {
				this.elementSetAttribute(element, key.substr(1),object[key]);
			} else if (typeof object[key] === 'string') {
				if (key === '#comment') {
					var child = document.createComment(this.CommentStringToXML(object[key]));
					element.appendChild(child);
				} else if (key === '#text') {
					var child = document.createTextNode(object[key]);
					element.appendChild(child);
				} else {
					// ordinary string attributes
					this.elementSetAttribute(element, key.substr(1), this.JSONStringToXML(object[key]));
				}
			} else if (typeof object[key] === 'boolean') {
				this.elementSetAttribute(element, key.substr(1),object[key]);
			} else if (typeof object[key] === 'undefined') {
			} else {
				console.error("Unknown type found in object "+typeof object[key]);
				console.error(object);
			}
		}
		if (isArray) {
			if (parentkey.substr(0,1) === '@') {
				if (arrayOfStrings) {
					arrayOfStrings = false;
					for (var str in localArray) {
						localArray[str] = this.SFStringToXML(localArray[str]);
					}
					this.elementSetAttribute(element, parentkey.substr(1),'"'+localArray.join('" "')+'"');
				} else {
					// if non string array
					this.elementSetAttribute(element, parentkey.substr(1),localArray.join(" "));
				}
			}
			isArray = false;
		}
		return element;
	};
