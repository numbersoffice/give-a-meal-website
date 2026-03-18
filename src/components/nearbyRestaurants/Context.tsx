"use client";

import getBusinessesByLocation from "@/functions/getBusinessesByLocation";
import { createContext, useEffect, useState } from "react";
import { Bounds } from "@/utils/getMapBounds";

export const NearbyRestaurantsContext = createContext<{
  businesses: any[] | null;
  selectedBusiness: { business: any; index: number } | null;
  setSelectedBusiness: React.Dispatch<
    React.SetStateAction<{ business: any; index: number } | null>
  >;
  addressFieldLocation: { lat: number; lon: number } | null;
  clientLocation: { lat: number; lon: number } | null;
  setClientLocation: React.Dispatch<
    React.SetStateAction<{ lat: number; lon: number } | null>
  >;
  setAddressFieldLocation: React.Dispatch<
    React.SetStateAction<{ lat: number; lon: number } | null>
  >;
  bounds: Bounds | null;
  setBounds: React.Dispatch<React.SetStateAction<Bounds | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  businesses: [],
  selectedBusiness: null,
  setSelectedBusiness: () => {},
  clientLocation: null,
  setClientLocation: () => {},
  addressFieldLocation: null,
  setAddressFieldLocation: () => {},
  bounds: null,
  setBounds: () => {},
  loading: true,
  setLoading: () => {},
});

export function NearbyRestaurantsProvider({ children }: { children: any }) {
  const [selectedBusiness, setSelectedBusiness] = useState<{
    business: any;
    index: number;
  } | null>(null);
  const [clientLocation, setClientLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [addressFieldLocation, setAddressFieldLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [businesses, setBusinesses] = useState<any[] | null>(null);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const pos = { lat: 40.7143, lon: -73.9513 };

  // Fetch business data
  useEffect(() => {
    if (bounds) {
      setLoading(true);
      getBusinessesByLocation(
        pos.lat,
        pos.lon,
        bounds.lat.min,
        bounds.lon.min,
        bounds.lat.max,
        bounds.lon.max,
      ).then((data) => {
        setBusinesses(data);
        setLoading(false);
      });
    }
  }, [bounds, pos.lat, pos.lon]);

  const value = {
    businesses,
    selectedBusiness,
    setSelectedBusiness,
    clientLocation,
    setClientLocation,
    addressFieldLocation,
    setAddressFieldLocation,
    bounds,
    setBounds,
    loading,
    setLoading,
  };

  return (
    <NearbyRestaurantsContext.Provider value={value}>
      {children}
    </NearbyRestaurantsContext.Provider>
  );
}
