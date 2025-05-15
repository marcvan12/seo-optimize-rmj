
import Image from "next/image";
import Car from "../components/Car";
export default function HeroBanner({ unsoldVehicleCount }) {

  return (
    <div className="relative w-full overflow-hidden z-10">
      <div className="absolute bottom-16 right-4 z-20 font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-3">
        {/* Car Icon in White Circle with Black Background */}
        <div className="bg-white rounded-full p-2 flex items-center justify-center">
          <Car className="h-20 w-20 max-[768px]:w-10 max-[768px]:h-10 text-black" />
        </div>

        {/* Count + Label stacked */}
        <div className="flex flex-col leading-tight">
          <h1 className="text-white font-bold text-[2rem] md:text-[4rem] tracking-wide text-shadow-custom">
            {unsoldVehicleCount}
          </h1>
          <h2 className="text-[1rem] md:text-[1.5rem] text-shadow-custom text-white">Units Available</h2>
        </div>
      </div>
      <div className="relative w-full h-[720px]">
        <img
          src="/samplebanner3.avif?w=720"
          srcSet="
    /samplebanner3.avif?w=360   360w,
    /samplebanner3.avif?w=720   720w,
    /samplebanner3.avif?w=1080 1080w
  "
          sizes="(max-width: 720px) 250px, 100vw"
          alt="Hero banner"
          width="1600"               // ← intrinsic width of your source file
          height="700"               // ← intrinsic height of your source file
          style={{
            width: '100%',           // fill its container
            height: 720,
            objectFit: 'cover'
          }}
          loading="eager"            // ensures it isn’t deferred
          fetchPriority="high"       // Chrome’s hint for LCP
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-5 flex justify-center items-center">
        <div className="p-4 w-full max-w-[1280px] absolute left-0 md:left-[40px] top-[40px] text-center md:text-left">
          <h1 className="text-white font-bold text-[2rem] md:text-[4rem] tracking-wide text-shadow-custom">
            REAL MOTOR JAPAN
          </h1>
          <p className="text-white font-semibold text-[1rem] md:text-[1.5rem] tracking-wide text-shadow-custom">
            Established in 1979, offers affordable, quality used vehicles sourced in Japan.
          </p>
        </div>
      </div>
    </div>

  );
}