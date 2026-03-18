"use client"

import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";
import { RefObject, useContext, useEffect, useRef, useState } from 'react';
import styles from "./styles.module.css";
import { NearbyRestaurantsContext } from "../Context";
import getMapBounds from "@/utils/getMapBounds";
import Loader from "@/components/loader";
import Image from "next/image";
import PlusIcon from "@/public/assets/icons/plus.svg";
import MinusIcon from "@/public/assets/icons/minus.svg";

export default function Map({ initialPosition, className }: { initialPosition: { lat: number, lon: number }, className?: string }) {
    const {
        businesses,
        selectedBusiness,
        setSelectedBusiness,
        loading,
        clientLocation,
        addressFieldLocation,
        setBounds,
    } = useContext(NearbyRestaurantsContext)
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>()
    const markersRef = useRef<google.maps.Marker[]>([])

    // ------------------
    // Map initialization
    // ------------------

    // Initialize map
    useEffect(() => {
        initMap(mapRef as any, initialPosition).then(setMap)
    }, [initialPosition])

    // Initialize markers
    useEffect(() => {
        if (map && businesses) {
            initMarkers(map, businesses, markersRef.current, setSelectedBusiness, selectedBusiness).then((newMarkers) => {
                markersRef.current = newMarkers
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, businesses])


    // ----------------------------------
    // Effects to update the map position
    // ----------------------------------

    // Client location
    // Center map when client location is updated
    useEffect(() => {
        if (clientLocation && map) {
            goToMarker(clientLocation.lat, clientLocation.lon, map);
        }
    }, [clientLocation, map]);

    // Address field
    // Center map when address field is updated
    useEffect(() => {
        if (addressFieldLocation && map) {
            goToMarker(addressFieldLocation.lat, addressFieldLocation.lon, map);
        }
    }, [addressFieldLocation, map]);


    // ---------
    // Listeners
    // ---------

    // Listen to the maps "idle" event 
    // to check if map has loaded and
    // to check if bounds have changed
    useEffect(() => {
        if (map) {
            map.addListener("idle", () => {
                const bounds = getMapBounds(map)
                setBounds(bounds)
            })
        }
    }, [map, setBounds])


    // ---------
    // Utils
    // ---------

    // Update the markers when the selected business changes
    useEffect(() => {
        if (selectedBusiness && map && businesses) {
            initMarkers(map, businesses, markersRef.current, setSelectedBusiness, selectedBusiness).then((newMarkers) => {
                markersRef.current = newMarkers
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBusiness])

    // Update z-index of markers when selected business changes
    useEffect(() => {
        markersRef.current.forEach((marker, index) => {
            if (selectedBusiness && selectedBusiness.index === index) {
                marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
            } else {
                marker.setZIndex(google.maps.Marker.MAX_ZINDEX);
            }
        });
    }, [selectedBusiness]);


    // ---------
    // Render
    // ---------
    return (
        <div className={styles.wrapper}>
            <div className={styles.container} ref={mapRef} />
            {loading && <div className={styles.loader}>
                <Loader />
            </div>}
            {/* Custom Zoom Controls */}
            {<div className={styles.zoomControls}>
                <button className={styles.zoomIn} onClick={() => map && map.setZoom(map.getZoom() as any + 1)}>
                    <Image src={PlusIcon} alt="Plus icon" width={16} height={16} />
                </button>
                <div className={styles.zoomDivider} />
                <button className={styles.zoomOut} onClick={() => map && map.setZoom(map.getZoom() as any - 1)}>
                    <Image src={MinusIcon} alt="Minus icon" width={16} height={16} />
                </button>
            </div>}
        </div>

    )
};


/**
 * Initialize the map 
 * @param mapRef The div tag to render the map into
 * @param initialPosition The location to center the map to
 */
async function initMap(mapRef: RefObject<HTMLDivElement>, initialPosition: { lat: number, lon: number }) {

    const loader = new GoogleMapsLoader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
    });

    const { Map } = await loader.importLibrary("maps");

    // Options
    const mapOptions: google.maps.MapOptions = {
        center: { lat: initialPosition.lat, lng: initialPosition.lon },
        zoom: 14,
        disableDefaultUI: true,
        mapId: "1c734fac6c1f1588",
        clickableIcons: false,
    }

    const map = new Map(mapRef.current as HTMLDivElement, mapOptions);

    return map;
}

/**
 * Add markers to the map
 * @param {google.maps.Map} map Reference to the initialized map
 * @param {[]} businesses An array of businesses
 * @param {google.maps.Marker[]} markers An array of markers
 * @param {({ business, index }: { business: any, index: number }) => void} setSelectedBusiness Function to set the selected business
 * @param {{ business: any, index: number }} [selectedBusiness] The selected business
 */
async function initMarkers(map: google.maps.Map, businesses: any[], markers: google.maps.Marker[], setSelectedBusiness: ({ business, index }: { business: any, index: number }) => void, selectedBusiness?: { business: any, index: number } | null) {

    // Clear markers
    for (var markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        markers[markerIndex].setMap(null);
    }

    const newMarkers = businesses.map((business, i) => {

        /**
         * Default map marker
         */
        const defaultMarker = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'black',
            fillOpacity: 1,
            scale: 9,
            strokeColor: 'white',
            strokeWeight: 1,
        };

        /**
         * Create custom map marker for clicked state
         * @param title Title to be displayed inside the marker 
         */
        function clickedStateMarker(title: string) {
            const padding = 18;
            const characterWidth = 8; // Approximate width per character
            const textLength = title.length * characterWidth;
            const svgWidth = textLength + (padding * 2);
            const svgHeight = 46;
            const totalHeight = svgHeight;

            return {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + '" height="' + totalHeight + '" viewBox="0 0 ' + svgWidth + ' ' + totalHeight + '">' +
                    '<rect rx="8" ry="8" width="100%" height="' + svgHeight + '" fill="#E5FF75" />' +
                    '<text x="50%" y="' + (svgHeight / 2) + '" alignment-baseline="middle" text-anchor="middle" fill="black" font-size="16" font-family="Arial, sans-serif" font-weight="bold">' + title + '</text>' +
                    '</svg>'
                ),
                scaledSize: new google.maps.Size(svgWidth, totalHeight),
                anchor: new google.maps.Point(svgWidth / 2, svgHeight / 2)
            };
        }

        // Create marker
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(business.lat, business.lon),
            map: map,
            icon: defaultMarker,
        });

        // Click event for marker
        google.maps.event.addListener(marker, 'click', () => {
            // Change the marker icon to a badge
            const badgeIcon = clickedStateMarker(business.business_name);
            marker.setIcon(badgeIcon);

            // Bring the selected marker to the front
            marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);

            // Update the state with the selected marker information
            setSelectedBusiness({ business: business, index: i });
        });

        // Set selected marker
        if (selectedBusiness && selectedBusiness.index === i) {
            const badgeIcon = clickedStateMarker(business.business_name);
            marker.setIcon(badgeIcon);
        }

        return marker;
    });

    return newMarkers;
}


/**
 * Center the map to a specific marker 
 * @param lat 
 * @param lon 
 * @param map 
 */
function goToMarker(lat: number, lon: number, map: google.maps.Map) {
    map.setCenter(new google.maps.LatLng(lat, lon));
    map.setZoom(15);
}

