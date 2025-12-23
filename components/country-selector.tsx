"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { COUNTRIES } from "@/lib/countries"

interface CountrySelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CountrySelector({ value, onChange, placeholder = "Select country..." }: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false)

  const selectedCountry = COUNTRIES.find((country) => country.name === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between hover:bg-accent/50 transition-colors bg-transparent"
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." className="h-9" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <span className="text-2xl mr-2">{country.flag}</span>
                  <span>{country.name}</span>
                  <Check className={cn("ml-auto h-4 w-4", value === country.name ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
