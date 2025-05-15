import { db } from "@/lib/firebaseAdmin";
import { FieldPath } from "firebase-admin/firestore";
export async function fetchCarMakes() {
  try {
    // Assuming your "Make" collection has a document "Make" that stores an array of makes in the "make" field.
    const makeDocRef = db.collection('Make').doc('Make');
    const snapshot = await makeDocRef.get();
    return snapshot.data()?.make || [];
  } catch (error) {
    console.error('Error fetching car makes:', error);
    return [];
  }
}
export async function fetchCarModels(db, selectedMake) {
  try {
    if (!selectedMake) return []; // Ensure a make is selected

    const modelDocRef = db.collection('Model').doc(selectedMake);
    const snapshot = await modelDocRef.get();

    return snapshot.exists ? snapshot.data()?.model || [] : [];
  } catch (error) {
    console.error(`Error fetching models for ${selectedMake}:`, error);
    return [];
  }
};
export async function fetchCarBodytype() {
  try {
    // Reference the document in "BodyType" collection
    const docRef = db.collection("BodyType").doc("BodyType");
    const snapshot = await docRef.get();

    // Retrieve the 'bodyType' array from the document
    return snapshot.exists ? snapshot.data()?.bodyType || [] : [];
  } catch (error) {
    console.error("Error fetching body types:", error);
    return [];
  }
}

export const getUnsoldVehicleCount = async () => {
  try {
    const snapshot = await db.collection('VehicleProducts')
      .where('stockStatus', '==', 'On-Sale')
      .where('imageCount', '>', 0)
      .count()
      .get();

    return snapshot.data()?.count ?? 0;
  } catch (error) {
    console.error('Error fetching document count:', error);
    return 0; // Return null instead of 0 to indicate an error
  }
};

export async function fetchCountries() {
  try {
    // Reference the Firestore document
    const countryRef = db.collection('CustomerCountryPort').doc('CountriesDoc');
    const docSnapshot = await countryRef.get();

    if (!docSnapshot.exists) {
      console.log("No such document!");
      return [];
    }

    const data = docSnapshot.data();
    const prioritizedCountries = ['Zambia', 'Tanzania', 'Mozambique', 'Kenya', 'Uganda', 'Zimbabwe', 'D_R_Congo'];

    // Prioritized countries
    const prioritizedSorted = prioritizedCountries.filter(country => country in data);

    // Sort the remaining countries alphabetically
    const otherCountriesSorted = Object.keys(data)
      .filter(country => !prioritizedCountries.includes(country))
      .sort();

    // Combine prioritized and alphabetized countries
    return [...prioritizedSorted, ...otherCountriesSorted];

  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
}
export async function fetchPorts(selectedCountry) {
  try {
    // Reference Firestore document
    const countriesDocRef = db.collection('CustomerCountryPort').doc('CountriesDoc');
    const docSnapshot = await countriesDocRef.get();

    if (!docSnapshot.exists) {
      console.log("CountriesDoc document does not exist!");
      return [];
    }

    const countriesData = docSnapshot.data();
    const countryData = countriesData[selectedCountry];

    if (!countryData || !countryData.nearestPorts) {
      console.log(`No nearestPorts data found for ${selectedCountry}`);
      return [];
    }

    // Return an array of port names
    return countryData.nearestPorts;

  } catch (error) {
    console.error("Error fetching ports:", error);
    return [];
  }
};

//fetch newVehicles
export async function fetchNewVehicle() {
  try {
    let queryRef = db.collection('VehicleProducts')
      .where('imageCount', '>', 0)
      .where('stockStatus', '==', 'On-Sale');
    queryRef = queryRef.orderBy('dateAdded', 'desc');
    queryRef = queryRef.limit(6);
    const snapshot = await queryRef.get();
    const newProducts = [];
    snapshot.forEach((doc) => {
      newProducts.push({ id: doc.id, ...doc.data() });
    });
    return newProducts;
  }
  catch {
    console.error(`Error fetching vehicle products for make: ${carMakes} and model: ${carModels}:`, error);
    return [];
  }
}

// /services/fetch.js
// services/fetchFirebaseData.js

const cursorCache = {};

export async function fetchVehicleProductsByPage({
  searchKeywords = '',
  page = 1,
  carMakes = null,
  carModels = null,
  carBodyType = '',
  sortField = "dateAdded",
  sortDirection = "asc",
  itemsPerPage = 50,
  minPrice = 0,
  maxPrice = 0,
  minYear = 0,
  maxYear = 0,
  minMileage = 0,
  maxMileage = 0,
  currency
}) {
  // Step 1: Base filtered query
  let q = db
    .collection("VehicleProducts")
    .where("imageCount", ">", 0)
    .where("stockStatus", "==", "On-Sale");
  if (searchKeywords) q = q.where('keywords', 'array-contains', searchKeywords.toLowerCase())
  if (carMakes) q = q.where("make", "==", carMakes);
  if (carModels) q = q.where("model", "==", carModels);
  if (carBodyType) q = q.where("bodyType", "==", carBodyType);
  if (minPrice) q = q.where('fobPriceNumber', ">=", Number(minPrice) / currency);
  if (maxPrice) q = q.where('fobPriceNumber', '<=', Number(maxPrice) / currency);
  if (minYear) q = q.where('regYearNumber', '>=', minYear);
  if (maxYear) q = q.where('regYearNumber', '<=', maxYear);
  if (minMileage) q = q.where('mileageNumber', '>=', minMileage);
  if (maxMileage) q = q.where('mileageNumber', '<=', maxMileage);
  // Step 2: Count total
  const countSnap = await q.count().get();

  const totalCount = countSnap.data().count;

  console.log(sortField, sortDirection)
  // Step 3: Sort
  q = q.orderBy(sortField, sortDirection);

  // Step 4: Apply cursor for pages > 1
  if (page > 1) {
    const prevCursor = cursorCache[page - 1];
    if (!prevCursor) throw new Error("Missing cursor for page " + page);
    q = q.startAfter(prevCursor);
  }

  // Step 5: Limit
  q = q.limit(itemsPerPage);

  // Step 6: Fetch
  const snap = await q.get();

  const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Step 7: Save cursor for next page
  const lastDoc = snap.docs[snap.docs.length - 1];
  cursorCache[page] = lastDoc || null;

  return { products, totalCount, currentPage: page };
}

export async function fetchCarDataAdmin(carId) {
  try {
    // Get a reference to the document in the "VehicleProducts" collection by its ID
    const carDocRef = db.collection("VehicleProducts").doc(carId);
    const snapshot = await carDocRef.get();
    if (!snapshot.exists) {
      throw new Error("Car not found");
    }
    return snapshot.data();
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    throw error;
  }
};

export async function fetchCurrency() {
  try {
    const currencyDocRef = db.collection('currency').doc('currency');
    const snapshot = await currencyDocRef.get();
    if (!snapshot.exists) {
      throw new Error('Currency not found');
    };
    return snapshot.data();
  } catch (error) {
    console.error('Error fetching currency data:', error);
    throw error;

  }
};

export async function fetchInspection(selectedPort) {
  try {
    // Reference Firestore document (using admin SDK style)
    const portDocRef = db.collection('CustomerCountryPort').doc('PortsDoc');
    const docSnapshot = await portDocRef.get();

    if (!docSnapshot.exists) {
      console.log("PortsDoc does not exist!");
      return null;
    }

    const portsData = docSnapshot.data();
    const selectedPortData = portsData[selectedPort];

    if (!selectedPortData) {
      console.log(`No data found for port: ${selectedPort}`);
      return null;
    }

    // Return the profitPrice (or the entire port data if needed)
    return selectedPortData
  } catch (error) {
    console.error("Error fetching inspection:", error);
    return null;
  }
}


//is has inspection
export async function fetchInspectionToggle(selectedCountry) {
  // If no country is selected, return defaults
  if (!selectedCountry) {
    return { toggle: false, isToggleDisabled: false };
  }

  // Reference to the document in Firestore
  const countriesDocRef = db.collection('CustomerCountryPort').doc('CountriesDoc');

  try {
    const docSnapshot = await countriesDocRef.get();
    if (!docSnapshot.exists) {
      console.log("CountriesDoc does not exist");
      return { toggle: false, isToggleDisabled: false };
    }

    const data = docSnapshot.data();
    const selectedCountryData = data[selectedCountry];

    if (selectedCountryData) {
      let toggle = false;
      let isToggleDisabled = false;
      // Set values based on the inspection requirement
      switch (selectedCountryData.inspectionIsRequired) {
        case "Required":
          toggle = true;
          isToggleDisabled = true;
          break;
        case "Not-Required":
          toggle = false;
          isToggleDisabled = true;
          break;
        case "Optional":
        default:
          isToggleDisabled = false;
          break;
      }

      return {
        toggle,
        isToggleDisabled,
        inspectionIsRequired: selectedCountryData.inspectionIsRequired,
        inspectionName: selectedCountryData.inspectionName,
      };
    } else {
      return { toggle: false, isToggleDisabled: false };
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return { toggle: false, isToggleDisabled: false };
  }
}



