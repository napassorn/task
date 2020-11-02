import gdal
in_path = 'D:/Github/my_task/task02/imageRGB_3mUTM.tif' #input composite raster
out_path = 'D:/Github/my_task/task02/Output/' #output directory for individual bands as files
out_path2 = 'D:/Github/my_task/task02/Output/image30mUTM.png' #output directory for resampling image resolution
out_path3= 'D:/Github/my_task/task02/Output/image30m4326.png' #output directory for converting from UTM to GCS (EPSG:4326)

#Open existing raster ds
src_ds = gdal.Open(in_path)

#Resampling image resolution
res = 30
gdal.Warp(out_path2, src_ds, format='GTiff', xRes=res,yRes=res)

#converting from UTM to GCS (EPSG:4326)
src_ds2 =gdal.Open(out_path2)
gdal.Warp(out_path3, src_ds2, dstSRS='EPSG:4326',format='VRT')


