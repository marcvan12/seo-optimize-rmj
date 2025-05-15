
import { SortProvider } from '@/app/stock/stockComponents/sortContext';
import { fetchCarDataAdmin, fetchCountries, fetchCurrency, fetchInspectionToggle } from '../../../../services/fetchFirebaseData';
import CarProductPageCSR from '../productComponents/CarProductPageCSR';
import VehicleSpecifications from '../productComponents/VehicleSpecificationsCSR';
import { useAuth } from '@/app/providers/AuthProvider';
import { makeFavorite, isFavorited } from '@/app/actions/actions';
import { admin } from '@/lib/firebaseAdmin';
import { cookies } from "next/headers";
import ClientAppCheck from '../../../../firebase/ClientAppCheck';
export async function generateMetadata({ params }) {
    const { id } = await params;

    // Fetch the product data for metadata.
    let product;
    try {
        product = await fetchCarDataAdmin(id);
    } catch (error) {
        console.error("Error fetching product for metadata:", error);
    }

    // Fallback metadata if product is not found.
    if (!product) {
        return {
            title: "Product Not Found | My Product Site",
            description: "The product you are looking for does not exist.",
        };
    }

    return {
        title: `${product.carName} - REAL MOTOR JAPAN`,
        description: product.carDescription || "Product details page",
        openGraph: {
            title: `${product.carName}`,
            description: product.carDescription,
            images: [
                {
                    url: product.imageUrl || "/defaultImage.png",
                    width: 800,
                    height: 600,
                    alt: product.carName,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${product.carName} - My Product Site`,
            description: product.carDescription,
            images: [product.imageUrl || "/defaultImage.png"],
        },
    };
}

export default async function ProductPage({ params, searchParams }) {
    const { id } = await params;
    const sp = await searchParams;
    const country = sp.country || "";
    const port = sp.port || "";
    const countryArray = await fetchCountries() || [];
    const carData = await fetchCarDataAdmin(id);
    const currency = await fetchCurrency() || [];

    let resultsIsFavorited = [];
    // Only attempt verification if a token exists
    let claims = null

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        return (
            <SortProvider>
                <div className="z-10 mt-20">
                    <CarProductPageCSR
                        resultsIsFavorited={''}
                        currency={currency}
                        carData={carData}
                        countryArray={countryArray}
                        useAuth={useAuth}
                    />
                    <VehicleSpecifications carData={carData} />
                </div>
            </SortProvider>
        )
    }

    try {
        claims = await admin
            .auth()
            .verifySessionCookie(sessionCookie, /* checkRevoked= */ true)
        resultsIsFavorited = await isFavorited({ userEmail: claims?.email });

    } catch (e) {
        console.log('Session invalid:', e)
        // optionally clear the cookie so you don’t keep retrying

    }

    const userEmail = claims?.email;
    return (
        <SortProvider>
            <ClientAppCheck />
            <div className="z-10 mt-20">
                <CarProductPageCSR

                    resultsIsFavorited={resultsIsFavorited}
                    currency={currency}
                    carData={carData}
                    countryArray={countryArray}
                    useAuth={useAuth}
                />
                <VehicleSpecifications carData={carData} />
            </div>
        </SortProvider>
    );
}
