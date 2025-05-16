'use client';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next/client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function ZambiaModal() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const seen = getCookie('zambia-modal-seen');
        if (!seen) {
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            // Set cookie to expire in 2 weeks
            setCookie('zambia-modal-seen', 'true', {
                maxAge: 14 * 24 * 60 * 60,
                path: pathname,
            });
        }
    };

    const handleClose = () => handleOpenChange(false);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-gradient-to-b from-blue-500 to-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center text-[#efefef]">
                        Check out our Zambia Branch!
                    </DialogTitle>
                </DialogHeader>

                {/* Custom close button (optional) */}


                <div className="relative h-[370px] w-full overflow-hidden rounded-md">
                    <Image
                        src="/zmbranch.webp"
                        alt="Cars being exported to Zambia"
                        fill
                        className="object-cover h-40"
                        priority={false}
                    />
                </div>

                <DialogDescription className="text-center pt-2">
                    We are excited to announce that we have established our Zambia branch,
                    expanding our reach and strengthening our presence in the region.
                </DialogDescription>
                <div className="flex justify-center gap-4 mt-4">
                    <Button asChild className="w-full bg-[#0000ff] py-4 hover:bg-blue-700">
                        <Link
                            href="/localinformation/Zambia"
                            aria-label="Learn more about our Zambia branch"
                        >
                            Learn more about our Zambia branch
                        </Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
