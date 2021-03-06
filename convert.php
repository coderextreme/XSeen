<?php
/*
 * Convert JSON from THREE editor to XSeen
 */
 
$json = getThreeJson();
$pObj = json_decode ($json, true);

//print_r ($pObj);

// --> Build array of defined geometries
$geometries = buildDefinedGeometries ($pObj{'geometries'});

// --> Build array of defined materials
$materials = buildDefinedMaterials ($pObj{'materials'});

// --> Build array of scene objects
$sceneObjects = buildSceneObjects ($pObj{'object'}['children']);

// --> Put everything together
$xseen = assembleXseen ($geometries, $materials, $sceneObjects);

print $xseen;

exit;

function buildDefinedGeometries ($geometries) {
	$Translate3X = array (
						'PlaneGeometry'		=> array('tag'=>'plane'),
						'BoxGeometry'		=> array('tag'=>'box'),
						'CylinderGeometry'	=> array('tag'=>'cylinder'),
						'SphereGeometry'	=> array('tag'=>'sphere'),
						);
	$Characteristics = array (
							'width', 'height', 'depth', 'radius', 'radiusTop', 'radiusBottom',
							'phiStart', 'phiLength', 'thetaStart', 'thetaLength',
							'widthSegments', 'heightSegments', 'depthSegments',
							);
	print "Found " . count($geometries) . " geometric elements\n";
	$items = processDefined ($geometries, $Translate3X, $Characteristics);
	return $items;
}
	
function processDefined ($elements, $Translate3X, $Characteristics, $debug=false) {
	$items = array();
	for ($ii=0; $ii<count($elements); $ii++) {
		$parameters = array();
		if (isset($Translate3X[$elements[$ii]{'type'}]['characteristics'])) $parameters = $Translate3X[$elements[$ii]{'type'}]['characteristics'];
		for ($jj=0; $jj<count($Characteristics); $jj++) {
			if (isset($elements[$ii][$Characteristics[$jj]])) {
				$parameters[$Characteristics[$jj]] = $elements[$ii]{$Characteristics[$jj]};
			}
		}
		if ($debug) {
			print "$ii: |" . $elements[$ii]{'type'} . "| --> |". $Translate3X[$elements[$ii]{'type'}]['tag'] ."|\n";
		}
		$items[] = array(
					'type'		=> $Translate3X[$elements[$ii]{'type'}]['tag'],
					'id'		=> $elements[$ii]{'uuid'},
					'Characteristics'	=> $parameters,
		);
	}
	return $items;
}

function buildDefinedMaterials ($materials) {
	print "Found " . count($materials) . " material elements\n";
	$Translate3X = array (
						'MeshPhongMaterial'		=> array('tag'=>'MeshPhongMaterial'),
						'MeshBasicMaterial'		=> array('tag'=>'MeshBasicMaterial'),
						);
	$Characteristics = array (
					'color', 'emissive', 'specular', 'shininess',
					'depthFunc', 'depthTest', 'depthWrite', 
					'wireframe',
							);
	$items = processDefined ($materials, $Translate3X, $Characteristics);
	return $items;
}

function buildSceneObjects ($scene) {
	print "Found " . count($scene) . " scene objects\n";
	$Translate3X = array (
						'Mesh'				=> array('tag'=>'mesh',),
						'DirectionalLight'	=> array('tag'=>'light', 'characteristics'=>array('type'=>'directional')),
						'PointLight'		=> array('tag'=>'light', 'characteristics'=>array('type'=>'point')),
						);
	$Characteristics = array (
								'name', 'matrix',
								'geometry', 'material',
								'color', 'intensity', 'distance', 'decay', 'shadow',
							);
	$items = processDefined ($scene, $Translate3X, $Characteristics, false);
	return $items;
}

function assembleXseen ($geometries, $materials, $sceneObjects) {
	print "assembleXSeen with " . count($geometries) . " geometries, " . count($materials) . " materials, and " . count($sceneObjects) . " scene objects\n";
	$output = '';
	$output .= print_r ($geometries, 1) . "\n";
	$output .= print_r ($materials, 1) . "\n";
	$output .= print_r ($sceneObjects, 1) . "\n";
	return $output;
}


function getThreeJson() {
	$json = '{
	"metadata": {
		"version": 4.5,
		"type": "Object",
		"generator": "Object3D.toJSON"
	},
	"geometries": [
		{
			"uuid": "8F05A1F2-3877-478B-8DFC-F572AC61AB3A",
			"type": "PlaneGeometry",
			"width": 300,
			"height": 400,
			"widthSegments": 1,
			"heightSegments": 1
		},
		{
			"uuid": "7149652B-DBD7-4CB7-A600-27A9AC005C95",
			"type": "BoxGeometry",
			"width": 20,
			"height": 10,
			"depth": 10,
			"widthSegments": 1,
			"heightSegments": 1,
			"depthSegments": 1
		},
		{
			"uuid": "EEDF0A9A-D174-44E4-9C2F-A2F5BB8BE7F5",
			"type": "CylinderGeometry",
			"radiusTop": 5,
			"radiusBottom": 5,
			"height": 20,
			"radialSegments": 32,
			"heightSegments": 1,
			"openEnded": false
		},
		{
			"uuid": "CABCC711-1331-4D4C-9FF6-409299F10C68",
			"type": "SphereGeometry",
			"radius": 5,
			"widthSegments": 32,
			"heightSegments": 16,
			"phiStart": 0,
			"phiLength": 6.28,
			"thetaStart": 0,
			"thetaLength": 3.14
		},
		{
			"uuid": "EFBF641D-F092-462E-B7FB-0BFAD1591EFC",
			"type": "BoxGeometry",
			"width": 20,
			"height": 10,
			"depth": 10,
			"widthSegments": 1,
			"heightSegments": 1,
			"depthSegments": 1
		}],
	"materials": [
		{
			"uuid": "2F69AF3A-DDF5-4BBA-87B5-80159F90DDBF",
			"type": "MeshPhongMaterial",
			"color": 86015,
			"emissive": 0,
			"specular": 1118481,
			"shininess": 30,
			"depthFunc": 3,
			"depthTest": true,
			"depthWrite": true
		},
		{
			"uuid": "D98FC4D1-169E-420A-92EA-20E55009A46D",
			"type": "MeshBasicMaterial",
			"color": 63744,
			"depthFunc": 3,
			"depthTest": true,
			"depthWrite": true,
			"wireframe": true
		},
		{
			"uuid": "3B9DE64D-E1C8-4C24-9F73-3A9E10E3E655",
			"type": "MeshPhongMaterial",
			"color": 16777215,
			"emissive": 0,
			"specular": 1118481,
			"shininess": 30,
			"depthFunc": 3,
			"depthTest": true,
			"depthWrite": true
		},
		{
			"uuid": "043B208C-1F83-42C6-802C-E0E35621C27C",
			"type": "MeshPhongMaterial",
			"color": 16777215,
			"emissive": 0,
			"specular": 1118481,
			"shininess": 30,
			"depthFunc": 3,
			"depthTest": true,
			"depthWrite": true
		},
		{
			"uuid": "40EC9BDA-91C0-4671-937A-2BCB6DA7EEBB",
			"type": "MeshBasicMaterial",
			"color": 63744,
			"depthFunc": 3,
			"depthTest": true,
			"depthWrite": true,
			"wireframe": true
		}],
	"object": {
		"uuid": "31517222-A9A7-4EAF-B5F6-60751C0BAB,A3",
		"type": "Scene",
		"name": "Scene",
		"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
		"children": [
			{
				"uuid": "EBBB1E63-6318-4752-AE2E-440A4E0B3EF3",
				"type": "Mesh",
				"name": "Ground",
				"matrix": [1,0,0,0,0,0.000796,-1,0,0,1,0.000796,0,0,0,0,1],
				"geometry": "8F05A1F2-3877-478B-8DFC-F572AC61AB3A",
				"material": "2F69AF3A-DDF5-4BBA-87B5-80159F90DDBF"
			},
			{
				"uuid": "6EE2E764-43E0-48E0-85F2-E0C8823C20DC",
				"type": "DirectionalLight",
				"name": "DirectionalLight 1",
				"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,100,200,150,1],
				"color": 16777215,
				"intensity": 1,
				"shadow": {
					"camera": {
						"uuid": "B3B6762A-2704-4614-B0DD-56349C3EA1F4",
						"type": "OrthographicCamera",
						"zoom": 1,
						"left": -5,
						"right": 5,
						"top": 5,
						"bottom": -5,
						"near": 0.5,
						"far": 500
					}
				}
			},
			{
				"uuid": "38219749-1E67-45F2-AB15-E64BA0940CAD",
				"type": "Mesh",
				"name": "Brick",
				"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,5,0,1],
				"geometry": "7149652B-DBD7-4CB7-A600-27A9AC005C95",
				"material": "D98FC4D1-169E-420A-92EA-20E55009A46D",
				"children": [
					{
						"uuid": "711A5955-8F17-4A8B-991A-7604D27E6FA0",
						"type": "Mesh",
						"name": "Cylinder",
						"matrix": [0.000796,0.000796,1,0,-1,0,0.000796,0,0,-1,0.000796,0,0,0,0,1],
						"geometry": "EEDF0A9A-D174-44E4-9C2F-A2F5BB8BE7F5",
						"material": "3B9DE64D-E1C8-4C24-9F73-3A9E10E3E655"
					}]
			},
			{
				"uuid": "18FFA67C-F893-4E7A-8A76-8D996DEBE0C6",
				"type": "Mesh",
				"name": "Ball",
				"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,5,35.549999,1],
				"geometry": "CABCC711-1331-4D4C-9FF6-409299F10C68",
				"material": "043B208C-1F83-42C6-802C-E0E35621C27C"
			},
			{
				"uuid": "6D660D49-39B8-40C3-95F6-E4E007AA8D79",
				"type": "Mesh",
				"name": "Paddle",
				"matrix": [2,0,0,0,0,1,0,0,0,0,1,0,0,5,159.539993,1],
				"geometry": "EFBF641D-F092-462E-B7FB-0BFAD1591EFC",
				"material": "40EC9BDA-91C0-4671-937A-2BCB6DA7EEBB",
				"children": [
					{
						"uuid": "4F5F884C-9E1B-45E6-8F1E-4D538A46D8CB",
						"type": "Mesh",
						"name": "Cylinder",
						"matrix": [0.000796,0.000796,1,0,-1,0,0.000796,0,0,-1,0.000796,0,0,0,0,1],
						"geometry": "EEDF0A9A-D174-44E4-9C2F-A2F5BB8BE7F5",
						"material": "3B9DE64D-E1C8-4C24-9F73-3A9E10E3E655"
					}]
			},
			{
				"uuid": "B0BEAF69-8B5D-4D87-ADCA-FDE83A02762D",
				"type": "PointLight",
				"name": "PointLight 2",
				"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,-116.543564,69.489571,-206.824829,1],
				"color": 16777215,
				"intensity": 1,
				"distance": 0,
				"decay": 1,
				"shadow": {
					"camera": {
						"uuid": "36E87E4B-114A-40AC-A70B-12BCBE5AC9FA",
						"type": "PerspectiveCamera",
						"fov": 90,
						"zoom": 1,
						"near": 0.5,
						"far": 500,
						"focus": 10,
						"aspect": 1,
						"filmGauge": 35,
						"filmOffset": 0
					}
				}
			}],
		"background": 11184810
	}
}';
	return $json;
}
?>