"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    
    // Add transition class to body
    document.body.classList.add('theme-transitioning')
    
    // Set the pseudo-element background to the new theme color
    const newBgColor = newTheme === 'dark' 
      ? 'oklch(0.147 0.004 49.25)' 
      : 'oklch(1 0 0)'
    
    document.body.style.setProperty('--transition-bg', newBgColor)
    
    // Start the slide animation
    setTimeout(() => {
      setTheme(newTheme)
    }, 300)
    
    // Clean up after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning')
    }, 800)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleThemeChange}
      className="relative overflow-hidden hover:scale-105 transition-transform duration-200"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 