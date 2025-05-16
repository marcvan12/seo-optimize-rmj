"use client";
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClientWrapper from "./homeComponents/ClientWrapper";
export default function ClientLayoutWrapper({ children, currency, userEmail }) {

  const pathname = usePathname();
  const pathsToHide = ["/chats", "/orders", "/favorites", "/profile"];
  const hideHeaderFooter = pathsToHide.some(p => pathname.startsWith(p));
  const hideFooterRoutes = ["/login", "/login/", "/accountCreation", "/accountCreation/", "/forgotpassword", "/forgotpassword/", "/signup/", "/signup",];
  return (

    <div className="flex flex-col overflow-x-clip">


      {!hideHeaderFooter && <Header currency={currency} userEmail={userEmail} />}


      {children}

      {!hideHeaderFooter && !hideFooterRoutes.includes(pathname) && <Footer />}

    </div>

  );
}
