"use client";

import { NearbyRestaurantsProvider } from './Context';
import ListView from './listView';
import Map from './map';
import SearchBar from './searchBar';
import styles from './styles.module.css';

export interface Dict {
    title: string;
    listTitle: string;
    listTitleEmpty: string;
    listSubEmpty: string;
    addressPlaceholder: string;
    listItems: {
        mealsSingular: string;
        mealsPlural: string;
    };
}

export default function NearbyRestaurants({ className, dict }: { className: string, dict: Dict }) {
    return (
        <NearbyRestaurantsProvider>
            <div className={`${styles.container} ${className}`}>
                <div className={styles.listContainer}>
                    <SearchBar dict={dict.addressPlaceholder} />
                    <ListView dict={dict} />
                </div>
                <div className={styles.mapContainer}>
                    <Map initialPosition={{ lat: 40.7143, lon: -73.9513 }} />
                </div>
            </div>
        </NearbyRestaurantsProvider>
    );
}
