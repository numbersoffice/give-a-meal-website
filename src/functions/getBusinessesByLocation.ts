/**
 * Returns the businesses closest to the given location
 * Limit of 10 results
 * @param lat Latitude
 * @param lon Longitude
 * @param minLat Minimum latitude
 * @param minLon Minimum longitude
 * @param maxLat Maximum latitude
 * @param maxLon Maximum longitude
 * @returns Array of businesses
 */
export default async function getBusinessesByLocation(
  lat: number | string,
  lon: number | string,
  minLat?: number | string,
  minLon?: number | string,
  maxLat?: number | string,
  maxLon?: number | string
) {
  // Convert value to number
  const _lat = Number(lat);
  const _lon = Number(lon);
  const _minLat = Number(minLat);
  const _minLon = Number(minLon);
  const _maxLat = Number(maxLat);
  const _maxLon = Number(maxLon);

  // Check if lat and lon are valid
  if (isNaN(_lat) || isNaN(_lon)) {
    console.log("Invalid value for lat or lon");
    return null;
  }

  // Create a new URLSearchParams object
  const params = new URLSearchParams();
  params.append("lat", _lat.toString());
  params.append("lon", _lon.toString());
  !isNaN(_minLat) && params.append("minlat", _minLat.toString());
  !isNaN(_minLon) && params.append("minlon", _minLon.toString());
  !isNaN(_maxLat) && params.append("maxlat", _maxLat.toString());
  !isNaN(_maxLon) && params.append("maxlon", _maxLon.toString());

  const url =
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/custom/public/businesses?` +
    params.toString();

  try {
    // Get businesses from API
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
}
