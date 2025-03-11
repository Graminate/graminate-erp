import { useEffect, useRef } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const LATITUDE = 26.13584410412397;
const LONGITUDE = 91.81508731307306;

const CurrentLocation = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        const map = new google.maps.Map(
          mapContainerRef.current as HTMLDivElement,
          {
            center: { lat: LATITUDE, lng: LONGITUDE },
            zoom: 15,
          }
        );

        new google.maps.Marker({
          position: { lat: LATITUDE, lng: LONGITUDE },
          map: map,
          title: "Our Location",
        });
      } else {
        console.error("Google Maps script not loaded");
      }
    };

    if (typeof window !== "undefined") {
      if (!(window as any).google) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = loadGoogleMaps;
        document.body.appendChild(script);
      } else {
        loadGoogleMaps();
      }
    }
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="h-[300px] w-full rounded-lg shadow-md md:h-[400px]"
    ></div>
  );
};

export default CurrentLocation;
