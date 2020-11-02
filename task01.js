//Assume geojson file
var geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Polygon(
                [[[102.8455928074242,16.64849268970715],
                [102.84657986034168,16.64937668923061],
                [102.84563572276844,16.650219568698606],
                [102.84471304286731,16.649356131148497]]]),
            {
              "system:index": "0"
            })]);
/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

// Create palettes for display of NDVI
var ndvi_pal = ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a'];

Map.setCenter(102.8455, 16.6484, 17);

var startDate = '2020-07-01';
var endDate = '2020-07-23';
var image = 'COPERNICUS/S2';

// Create image collection of S-2 imagery for the perdiod 2016-2018
var Sentinel2 = ee.ImageCollection(image)
//filter start and end date
.filterDate(startDate, endDate)
// Pre-filter to get less cloudy granules.
.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',10))
//filter according to drawn boundary
.filterBounds(geometry);

var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

// Function to calculate and add an NDVI band
var addNDVI = function(image) {
return image.addBands(image.normalizedDifference(['B8', 'B4']));
};

// Add NDVI band to image collection
var S2 = Sentinel2.map(addNDVI);
// Extract NDVI band and create NDVI median composite image
var NDVI = S2.select(['nd']);
var NDVImed = NDVI.mean().clip(geometry); //I just changed the name of this variable ;)

var meanDictionary = NDVImed.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: geometry,
  scale: 10,
  maxPixels: 1e9
});

//print avarge NDVI in a field
var avgNDVI = meanDictionary;
print("Average NDVI in field: ", avgNDVI);

//visuallize image RGB was filtered cloud QA60
var Sentinel2_ = ee.ImageCollection(image)
//filter start and end date
.filterDate(startDate, endDate)
// Pre-filter to get less cloudy granules.
.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',10))
//filter according to drawn boundary
.filterBounds(geometry)
.map(maskS2clouds);

// Display image RGB
Map.addLayer(Sentinel2_.mean(), visualization, 'An image in RGB');
// Display NDVI results on map
Map.addLayer(NDVImed.clip(geometry), {min:-0.1, max:0.9, palette: ndvi_pal}, 'NDVI');

