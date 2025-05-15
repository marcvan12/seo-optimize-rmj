"use client"
import Link from "next/link"
import { Menu, UserPlus, LogIn, MessageSquare, CircleUser } from "lucide-react"
import { useState, useEffect, use } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "../providers/AuthProvider"
import { Skeleton } from "@/components/ui/skeleton"
import CurrencyDropdown from "./CurrencyDropdown"
import { usePathname } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, ShoppingBag, Heart, FileText } from "lucide-react"
import ImageHeader from "./ImageHeader"
import NotificationCount from "./NotificationBell"
const NAV_LINKS = [
    { href: "/stock", label: "Car Stock" },
    { href: "/howtobuy", label: "How to Buy" },
    { href: "/about", label: "About Us" },
    { href: "/localintroduction", label: "Local Introduction" },
    { href: "/contactus", label: "Contact Us" },
]

function DesktopNavigation() {
    return (
        <nav className="hidden lg:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors font-semibold"
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    )
}

function DesktopAuth() {
    const { user, loading, logOut, counts } = useAuth()
    if (loading) {
        return (
            <div className="flex items-center gap-4">
                {/* Render two Shadcn skeletons as placeholders */}
                <Skeleton className="w-36 h-12 rounded-sm" />
                <Skeleton className="w-36 h-12 rounded-sm" />
            </div>
        )
    }
    if (user) {
        return (
            <div className="flex items-center gap-4 font-semibold">
                <Link
                    href="/chats"
                    className="relative flex flex-col items-center justify-center rounded-lg transition group
        min-[1117px]:flex-row min-[1117px]:gap-2 min-[1117px]:px-4 min-[1117px]:py-2
        min-[1117px]:transparent min-[1117px]:rounded-sm"
                >
                    <div className="relative flex items-center">
                        <MessageSquare
                            className={`
            w-7 h-7
            min-[1117px]:text-[#0000ff]
            min-[320px]:text-[#0000ff]
            transform transition-transform duration-200 ease-in-out
            group-hover:-translate-y-1
          `}
                        />


                        <span
                            className="absolute -top-2 left-3 inline-flex items-center justify-center 
              w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full
              transform transition-transform duration-200 ease-in-out group-hover:-translate-y-1"
                        >
                            <NotificationCount userEmail={user} />
                        </span>

                    </div>

                    <span className="text-sm min-[1117px]:text-gray-700 min-[320px]:text-gray-700">Transactions</span>
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="w-15 h-15 flex flex-col items-center justify-center rounded-lg transition group
                  min-[1117px]:flex-row min-[1117px]:gap-2 min-[1117px]:px-4 min-[1117px]:py-2
                  min-[1117px]:transparent min-[1117px]:rounded-sm"
                        >
                            <CircleUser className={`
    w-7 h-7
    min-[1117px]:text-[#0000ff]
    min-[320px]:text-[#0000ff]

    transform
    transition-transform duration-200 ease-in-out
    group-hover:-translate-y-1
  `} />
                            <span className="text-sm min-[1117px]:text-gray-700 min-[320px]:text-gray-700">Account</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/chats" className="flex items-center gap-2 cursor-pointer relative">
                                <div className="relative">
                                    <MessageSquare className="w-4 h-4" />

                                    <span
                                        className="absolute -top-2 -right-2 inline-flex items-center justify-center 
              w-4 h-4 text-[10px] font-semibold text-white bg-red-500 rounded-full"
                                    >
                                        <NotificationCount userEmail={user} />
                                    </span>

                                </div>
                                <span>Transactions</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                                <ShoppingBag className="w-4 h-4" />
                                <span>My Orders</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/favorites" className="flex items-center gap-2 cursor-pointer">
                                <Heart className="w-4 h-4" />
                                <span>Favorites</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => logOut()}
                            className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    } else {
        return (
            <div className="flex items-center gap-4">
                {/* Sign Up Link */}
                <Link
                    href="/signup"
                    className="w-15 h-15 flex flex-col items-center justify-center rounded-lg transition group
              min-[1117px]:flex-row min-[1117px]:gap-2 min-[1117px]:px-4 min-[1117px]:py-2
              min-[1117px]:border min-[1117px]:border-blue-600 min-[1117px]:text-blue-600 min-[1117px]:rounded-sm"
                >
                    <UserPlus className="w-7 h-7 text-[#0000ff] group-hover:text-[#0036b1]" />
                    <span className="text-sm font-semibold text-center text-gray-700 group-hover:text-[#a0a0a0] min-[1117px]:text-[#0000ff]">Sign Up</span>
                </Link>

                {/* Login Link */}
                <Link
                    href="/login"
                    className="w-15 h-15 flex flex-col items-center justify-center rounded-lg transition group
              min-[1117px]:flex-row min-[1117px]:gap-2 min-[1117px]:px-4 min-[1117px]:py-2
              min-[1117px]:bg-[#0000ff] min-[1117px]:text-white min-[1117px]:rounded-sm"
                >
                    <LogIn className="w-7 h-7 text-[#0000ff] min-[1117px]:text-white" />
                    <span className="text-sm font-semibold text-center text-gray-700 group-hover:text-[#a0a0a0] min-[1117px]:text-white">Log In</span>
                </Link>
            </div>
        )
    }
}
function MobileMenu({ isOpen, setIsOpen }) {
    const { user, logOut, counts } = useAuth()
    return (
        <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-15 h-15 flex flex-col items-center justify-center border-gray-300 rounded-lg transition group"
                    >
                        <Menu className="w-7 h-7 text-[#0000ff] group-hover:text-[#0036b1]" />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-[#a0a0a0]">Menu</span>
                    </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80vw]">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col space-y-4 mt-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 text-lg font-medium hover:bg-gray-100 px-4 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="border-t pt-4 flex flex-col space-y-4">
                            {user ? (
                                <>
                                    <Link
                                        href="/chats"
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="relative">
                                            <MessageSquare className="w-5 h-5" />

                                            <span
                                                className="absolute -top-2 -right-2 inline-flex items-center justify-center 
              w-4 h-4 text-[10px] font-semibold text-white bg-red-500 rounded-full"
                                            >
                                                <NotificationCount userEmail={user} />
                                            </span>

                                        </div>
                                        <span>Transactions</span>
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <CircleUser className="w-5 h-5" />
                                        Profile
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        My Orders
                                    </Link>
                                    <Link
                                        href="/favorites"
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Heart className="w-5 h-5" />
                                        Favorites
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logOut()
                                            setIsOpen(false)
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-left"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-center py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="text-center py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default function Header({ currency, counts }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isFixed, setIsFixed] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsFixed(window.scrollY > 0)
        }

        // Immediately check the scroll position on mount
        handleScroll()

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])
    const pathname = usePathname()

    if (pathname === "/") {
        return (
            <>
                <div className=" bg-white/90 p-2 flex justify-end mr-4" >
                    <CurrencyDropdown currency={currency} />
                </div>
                <header
                    className={`${isFixed ? "fixed top-0 z-50 bg-white/80" : ""} shadow-md backdrop-blur-lg h-[75px] w-full  border-solid border-b-4 border-[#0000ff]`}
                >
                    <div className="flex items-center justify-between h-full">
                        <div className="flex items-center space-x-8 overflow-hidden">
                            <Link href="/" className="h-auto overflow-hidden">
                                <ImageHeader
                                    src="/rmj.webp"
                                    alt="REAL MOTOR JAPAN"
                                    width={250}
                                    height={65}
                                    quality={75}                 // compress more aggressively
                                    priority                      // LCP priority
                                    sizes="(max-width: 640px) 150px, 250px"
                                    style={{ width: '250px', height: '70px', objectFit: 'cover' }}
                                />


                            </Link>
                            <DesktopNavigation counts={counts} />
                        </div>
                        <div className="flex items-center space-x-5 mr-5">
                            <DesktopAuth counts={counts} />
                            <MobileMenu counts={counts} isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
                        </div>
                    </div>
                </header>
            </>
        )
    }

    return (
        <header className={`fixed top-0 z-50 bg-white/90 shadow-md  h-[75px] w-full border-solid border-b-4 border-[#0000ff]`}>
            <div className="flex items-center justify-between h-full ">
                <div className="flex items-center space-x-8 overflow-hidden">
                    <Link href="/" className="h-auto overflow-hidden">
                        <ImageHeader
                            src="/rmj.webp"
                            alt="REAL MOTOR JAPAN"
                            width={250}
                            height={65}
                            quality={75}                 // compress more aggressively
                            priority                      // LCP priority
                            sizes="(max-width: 640px) 150px, 250px"
                            style={{ width: '250px', height: '70px', objectFit: 'cover' }}
                        />


                    </Link>
                    <DesktopNavigation />
                </div>
                <div className="flex items-center space-x-5 mr-5">
                    <DesktopAuth counts={counts} />
                    <MobileMenu counts={counts} isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
                </div>
            </div>
        </header>
    )
}
