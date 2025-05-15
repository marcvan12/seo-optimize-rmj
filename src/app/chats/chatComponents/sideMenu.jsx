import Link from 'next/link'
import { Menu, X, UserPlus, LogIn } from 'lucide-react'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet'





const NAV_LINKS = [
    { href: '/stock', label: 'Car Stock' },
    { href: '/howtobuy', label: 'How to Buy' },
    { href: '/about', label: 'About Us' },
    { href: '/localintroduction', label: 'Local Introduction' },
    { href: '/contactus', label: 'Contact Us' },
]
export function SideMenu({isOpen, setIsOpen}) {
    return (
        <div className="mb-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-15 h-15 flex flex-col items-center justify-center border-gray-300 rounded-lg transition group"
                    >
                        <Menu className="w-7 h-7 text-[#0000ff] group-hover:text-[#0036b1]" />
                   
                    </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80vw]">
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
                    
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}