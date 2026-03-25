"use client"

import styles from "./styles.module.css"
import Close from "@/public/assets/icons/close.svg"
import Search from "@/public/assets/icons/search.svg"
import Location from "@/public/assets/icons/location.svg"
import Image from "next/image"
import React from "react"
import { NearbyRestaurantsContext } from "../Context"
export default function SearchBar({ dict }: { dict: string }) {
    const { setAddressFieldLocation, clientLocation, setClientLocation } = React.useContext(NearbyRestaurantsContext)
    const [value, setValue] = React.useState<string>("")

    /**
     * Clears the address input field
     * This function does not refresh the map
     * @param e The event object
     */
    function handleClear(e: React.PointerEvent<HTMLDivElement>) {
        e.preventDefault()
        setValue("")
    }

    /**
     * This will geocode the address and then set the address field location
     * @param e The event object
     */
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        try {
            const res = await fetch(`/api/custom/public/geocode?address=${encodeURIComponent(value)}`)
            const location = await res.json()
            if (res.ok) setAddressFieldLocation(location)
        } catch (error) {
            console.error("Error during geocoding:", error)
        }
    }


    /**
     * Get the client's location
     * Then center the map to that location
     */
    function handleClientLocationRequest() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setClientLocation({ lat: position.coords.latitude, lon: position.coords.longitude })
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    return (
        <div className={styles.wrapper}>
            <form className={styles.container} onSubmit={handleSubmit}>
                <div className={`${styles.locationButtonContainer} ${clientLocation && styles.enabled || ""}`} onPointerDown={handleClientLocationRequest}>
                    <Image src={Location} alt="Location icon" width={16} height={16} />
                </div>
                <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={dict} />
                <div className={styles.buttonContainer}>
                    <div className={styles.searchButtonContainer}>
                        <div className={styles.searchIconContainer}>
                            <Image src={Search} alt="Search icon" width={16} height={16} />
                        </div>
                    </div>
                    <div className={styles.closeButtonContainer} onPointerDown={handleClear}>
                        <div className={styles.closeIconContainer}>
                            <Image src={Close} alt="Close icon" width={16} height={16} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}