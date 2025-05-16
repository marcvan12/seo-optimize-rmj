'use server'
import { admin } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import CarListings from "./stockComponents/CarListings";
import SearchHeader from "./stockComponents/Pagination";
import CarSearch from "./stockComponents/SearchQuery";
import {
  fetchCarMakes,
  fetchVehicleProductsByPage,
  fetchCarBodytype,
  fetchCountries,
  fetchCurrency,
} from "../../../services/fetchFirebaseData";
import { isFavorited } from "../actions/actions";
import { SortProvider } from "./stockComponents/sortContext";
import { ZambiaModalClient } from "../components/ZambiaModalClient";

// In-memory cursor map (Note: not SSR-safe, use in client or persist elsewhere)
export async function generateMetadata({ params, searchParams }) {
  // 1) fetch your look-ups in parallel
  const [carMakes, carBodytypes, countryArray, currency] = await Promise.all([
    fetchCarMakes(),
    fetchCarBodytype(),
    fetchCountries(),
    fetchCurrency(),
  ]);
  const paramsAwaited = await params
  // 2) pull and decode your dynamic route params (no await needed)
  const makerRaw = await paramsAwaited.maker ?? "";
  const modelRaw = await paramsAwaited.model ?? "";
  const keywordsRaw = await paramsAwaited.keyword ?? "";
  const maker = decodeURIComponent(makerRaw);
  const model = decodeURIComponent(modelRaw);
  const keywords = decodeURIComponent(keywordsRaw);
  // 3) destructure your query params directly (they’re already a plain object)
  const {
    searchKeywords = "",
    bodytype = "",
    limit = "50",
    sort = "dateAdded-asc",
    page = "1",
    country = "",
    port = "",
    minPrice = "0",
    maxPrice = "0",
    minYear = "0",
    maxYear = "0",
    minMileage = "0",
    maxMileage = "0",
  } = await searchParams;

  // 4) parse anything that needs to be a number
  const pageNumber = parseInt(page, 10);
  const itemsPerPage = parseInt(limit, 10);
  const numericMinPrice = parseInt(minPrice, 10);
  const numericMaxPrice = parseInt(maxPrice, 10);
  const numericMinYear = parseInt(minYear, 10);
  const numericMaxYear = parseInt(maxYear, 10);
  const numericMinMileage = parseInt(minMileage, 10);
  const numericMaxMileage = parseInt(maxMileage, 10);

  // 5) split your sort
  const [sortField, sortDirection] = sort.split("-");

  // 6) call your API
  const { products, totalCount } = await fetchVehicleProductsByPage({
    searchKeywords: searchKeywords ? searchKeywords.toLowerCase() : null,
    carMakes: maker ? maker.toUpperCase() : null,
    carModels: model ? model.toUpperCase() : null,
    carBodyType: bodytype,
    sortField,
    sortDirection,
    itemsPerPage,
    page: pageNumber,
    minPrice: numericMinPrice,
    maxPrice: numericMaxPrice,
    minYear: numericMinYear,
    maxYear: numericMaxYear,
    minMileage: numericMinMileage,
    maxMileage: numericMaxMileage,
    currency: currency.jpyToUsd,
  });



  // 7) build your metadata
  const title = `Car Stock (${totalCount.toLocaleString() ?? 0} units) | REAL MOTOR JAPAN`


  const description = `Browse our stock. Used Japanese Cars`


  return { title, description };
}

const CarStock = async ({ params, searchParams }) => {
  const { maker = "", model = "" } = await params;
  const sp = await searchParams || {};
  // 1) Extract pagination & sort from URL
  const {
    searchKeywords = "",
    bodytype = "",
    limit = 50,
    sort = "dateAdded-asc",
    page = "1", // ✅ page number
    country = "",
    port = "",
    minPrice = 0,
    maxPrice = 0,
    minYear = 0,
    maxYear = 0,
    minMileage = 0,
    maxMileage = 0
  } = sp;
  const pageNumber = parseInt(page, 10);
  // 2) Parse sortField & sortDirection
  const [sortField, sortDirection] = sort.split("-");
  // 3) Fetch your products using page-based logic
  // 4) Pre-load dropdown data
  const [carMakes, carBodytypes, countryArray, currency] = await Promise.all([
    fetchCarMakes(),
    fetchCarBodytype(),
    fetchCountries(),
    fetchCurrency(),
  ]);
  const { products, totalCount } = await fetchVehicleProductsByPage({
    searchKeywords: searchKeywords.toLowerCase(),
    carMakes: decodeURIComponent(maker?.toUpperCase()) || null,
    carModels: decodeURIComponent(model?.toUpperCase()) || null,
    carBodyType: bodytype,
    sortField: sortField,
    sortDirection: sortDirection,
    itemsPerPage: limit,
    page: pageNumber,
    minPrice: minPrice,
    maxPrice: maxPrice,
    minYear: minYear,
    maxYear: maxYear,
    minMileage: minMileage,
    maxMileage: maxMileage,
    currency: currency.jpyToUsd
  });

  const carFilters = {
    make: decodeURIComponent(maker?.toUpperCase()) || null,
    model: decodeURIComponent(maker?.toUpperCase()) || null,
  }
  let claims = null
  let resultsIsFavorited = [];

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) {
    return (
      <SortProvider>
        <div className="z-10 mt-20">
          <div className="relative z-11">
            <CarSearch
              carFiltersServer={carFilters}
              carMakes={carMakes}
              countryArray={countryArray}
              carBodytypes={carBodytypes}
              initialMaker={maker}
              initialModel={model}
              initialBodyType={bodytype}
              country={country}
              port={port}

            />
          </div>
          <SearchHeader
            totalCount={totalCount}
            initialLimit={50}
            products={products}
            sortField={sortField}
            sortDirection={sortDirection}
            currency={currency}
            currentPage={pageNumber} // ✅ added for page nav
            country={country}
            port={port}
            userEmail={null}
          >
            <CarListings
              resultsIsFavorited={resultsIsFavorited}
              products={products}
              currency={currency}
              country={country}
              port={port}
              userEmail={null}
            />
          </SearchHeader>

        </div>
        <ZambiaModalClient />
      </SortProvider>
    );
  }
  try {
    claims = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true)


    resultsIsFavorited = await isFavorited({ userEmail: claims?.email });
  } catch (e) {
    console.log('Session invalid:', e)
    // optionally clear the cookie so you don’t keep retrying

  }

  return (
    <SortProvider>
      <div className="z-10 mt-20">
        <div className="relative z-11">
          <CarSearch
            carFiltersServer={carFilters}
            carMakes={carMakes}
            countryArray={countryArray}
            carBodytypes={carBodytypes}
            initialMaker={maker}
            initialModel={model}
            initialBodyType={bodytype}
            country={country}
            port={port}

          />
        </div>
        <SearchHeader
          totalCount={totalCount}
          initialLimit={50}
          products={products}
          sortField={sortField}
          sortDirection={sortDirection}
          currency={currency}
          currentPage={pageNumber} // ✅ added for page nav
          country={country}
          port={port}
          userEmail={claims?.email}
        >
          <CarListings
            resultsIsFavorited={resultsIsFavorited}
            products={products}
            currency={currency}
            country={country}
            port={port}
            userEmail={claims?.email}
          />
        </SearchHeader>
      </div>
      <ZambiaModalClient />
    </SortProvider>
  );
};

export default CarStock;