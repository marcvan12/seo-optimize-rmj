'use client'
import Image from "next/image";
import { Star, ShipWheel as SteeringWheel, Plus, ChevronRight, ChevronLeft, Heart, Car, Gauge, Palette,Fuel  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useCurrency } from "@/providers/CurrencyContext";
import AnimatedHeartButton from "./animatedHeart";
import { useSort } from "./sortContext";
import { useRouter } from "next/navigation";
// Skeleton placeholder for loading
export function CarCardSkeleton() {
  return (
    <Card className="max-w-7xl mx-auto overflow-hidden border border-gray-200 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-64 sm:h-auto sm:w-96 l:w-[36rem] flex-shrink-0">
          <Skeleton className="h-full w-full object-cover" />
          <Badge variant="secondary" className="absolute left-4 top-4 bg-white/90 font-medium">
            <SteeringWheel className="mr-2 h-4 w-4" />
            <Skeleton className="w-12 h-4" />
          </Badge>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-6">
            <Skeleton className="h-6 w-40" />
            <Button variant="outline" size="sm" className="shrink-0" disabled>
              <Heart className="mr-1 h-4 w-4" />
              <Skeleton className="w-20 h-4" />
            </Button>
          </div>
          <div className="mt-6">
            <div className="text-sm text-gray-500">FOB Price</div>
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Year</span>
              <Skeleton className="w-12 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Mileage</span>
              <Skeleton className="w-16 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Exterior Color</span>
              <Skeleton className="w-16 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Engine Displacement</span>
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
          <div className="grid">
            <div className="mt-6 justify-self-end">
              <Button className="w-full sm:w-auto" size="lg">
                <Skeleton className="w-20 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Single car card display
function CarCard({
  images = [],
  carName,
  fobPrice,
  regYear,
  mileage,
  exteriorColor,
  engineDisplacement,
  dimensionCubicMeters,
  referenceNumber,
  stockID,
  currency,
  portParams,
  countryParams,
  product,
  userEmail,
  resultsIsFavorited,
  router
}) {

  const { profitMap, inspectionToggle } = useSort();
  const { selectedCurrency } = useCurrency();
  const imageUrl = images[0];
  const basePrice = parseFloat(fobPrice) * parseFloat(currency.jpyToUsd);
  const baseFinalPrice = (basePrice) + (parseFloat(dimensionCubicMeters) * parseFloat(profitMap));
  const finalPrice = (((baseFinalPrice * selectedCurrency.value) + (inspectionToggle ? 300 : 0)));

  return (
    <Card key={stockID} className="max-w-7xl mx-auto overflow-hidden border border-gray-200 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-64 sm:h-auto sm:w-96 l:w-[36rem] flex-shrink-0">
          <Image
            src={imageUrl}
            alt={carName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover`}
            priority

          />
          <Badge variant="secondary" className="absolute left-4 top-4 bg-white/90 font-medium">
            <SteeringWheel className="mr-2 h-4 w-4" />
            {referenceNumber}
          </Badge>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-6">
            <h3 className="text-xl font-bold">{carName}</h3>
            <AnimatedHeartButton router={router} resultsIsFavorited={resultsIsFavorited} product={product} stockID={stockID} userEmail={userEmail} />
          </div>
          <div className="mt-6 flex flex-row justify-between max-[425px]:flex-col max-[425px]:space-y-4">
            <div>
              <div className="text-sm text-gray-500">FOB Price</div>
              <div className="text-2xl font-bold">
                {selectedCurrency.symbol}{' '}
                {Math.ceil(basePrice * selectedCurrency.value).toLocaleString()}
              </div>
            </div>
            {countryParams && portParams && (
              <div>
                <div className="text-sm text-gray-500">Final Price</div>
                <div className="text-2xl font-bold">
                  {!profitMap
                    ? 'ASK'
                    : `${selectedCurrency.symbol} ${Math.ceil(finalPrice).toLocaleString()}`}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Car className="iconText text-gray-500 w-5 h-5" />
              <span className="label text-gray-500">Year</span>
              <span className="font-medium">{regYear}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="iconText text-gray-500 w-5 h-5" />
              <span className="label text-gray-500">Mileage</span>
              <span className="font-medium">{mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="iconText text-gray-500 w-5 h-5" />
              <span className="label text-gray-500">Exterior Color</span>
              <span className="font-medium">{exteriorColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="iconText text-gray-500 w-5 h-5" />
              <span className="label text-gray-500">Engine Displacement</span>
              <span className="font-medium">{engineDisplacement}cc</span>
            </div>
          </div>
          <div className="grid sm:w-full">
            <div className="mt-6 justify-self-stretch sm:justify-self-end">
              <Link
                href={
                  countryParams && portParams
                    ? `/product/${stockID}?country=${countryParams}&port=${portParams}`
                    : `/product/${stockID}`
                }
              >
                <Button className="w-full sm:w-auto bg-[#0000ff] hover:bg-[#0000dd] font-semibold" size="lg">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function CarListings({ loadingSkeleton, resultsIsFavorited, products, currency, country, port, userEmail }) {

  const router = useRouter()
  return (
    <div className="space-y-4 p-4 mx-auto w-full">
      {
        products.map((car, index) => (
          <CarCard
            key={index}
            {...car}
            router={router}
            product={car}
            currency={currency}
            countryParams={country}
            portParams={port}
            userEmail={userEmail}
            resultsIsFavorited={resultsIsFavorited}
          />
        ))
      }

    </div>
  );
};




