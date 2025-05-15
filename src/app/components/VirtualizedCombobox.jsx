"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { FixedSizeList as List } from "react-window"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function VirtualizedCombobox({
    items,
    placeholder = "Select an item...",
    emptyMessage = "No items found.",
    value,
    onSelect,
    className,
    disabled = false,
    // New props for customizing key names:
    valueKey = "isoCode",
    labelKey = "name",
}) {
    const [open, setOpen] = React.useState(false)
    const [selectedValue, setSelectedValue] = React.useState(value || "")
    const [searchQuery, setSearchQuery] = React.useState("")

    React.useEffect(() => {
        setSelectedValue(value || "")
    }, [value])
    const filteredItems = React.useMemo(() => {
        if (!searchQuery) return items
        return items.filter((item) => {
            const label = typeof item === "object" ? item[labelKey] : item
            return label.toLowerCase().includes(searchQuery.toLowerCase())
        })
    }, [items, searchQuery, labelKey])
    const selectedLabel = React.useMemo(() => {
        const selected = items.find((item) => {
            const itemVal = typeof item === "object" ? item[valueKey] : item
            return itemVal === selectedValue
        })
        return selected ? (typeof selected === "object" ? selected[labelKey] : selected) : ""
    }, [items, selectedValue, valueKey, labelKey])

    const handleSelect = React.useCallback(
        (currentValue) => {
            setSelectedValue(currentValue)
            setOpen(false)
            if (onSelect) onSelect(currentValue)
        },
        [onSelect]
    )

    const parentRef = React.useRef(null)

    const getAvailableHeight = () => {
        if (typeof window === "undefined") return 300
        return Math.min(250, window.innerHeight - 200)
    }

    const rowHeight = 36
    const defaultListHeight = getAvailableHeight()

    const listHeight =
        searchQuery.trim() === ""
            ? defaultListHeight
            : Math.min(defaultListHeight, filteredItems.length * rowHeight)

    const Row = React.useCallback(
        ({ index, style }) => {
            const item = filteredItems[index]
            // If the item is an object, use the provided keys; otherwise, assume it's a string.
            const itemValue = typeof item === "object" ? item[valueKey] : item
            const itemLabel = typeof item === "object" ? item[labelKey] : item

            return (
                <CommandItem
                    key={itemValue}
                    value={itemValue}
                    onSelect={handleSelect}
                    style={style}
                    className="px-2 py-1.5"
                >
                    <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            selectedValue === itemValue ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {itemLabel}
                </CommandItem>
            )
        },
        [filteredItems, handleSelect, selectedValue, valueKey, labelKey]
    )


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    {selectedValue ? selectedLabel : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[9999]" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup ref={parentRef} className="overflow-hidden">
                            {filteredItems.length > 0 && (
                                <List
                                    key={searchQuery || "all"} // Forces re-render when search changes.
                                    height={listHeight}
                                    itemCount={filteredItems.length}
                                    itemSize={rowHeight}
                                    width="100%"
                                >
                                    {Row}
                                </List>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
