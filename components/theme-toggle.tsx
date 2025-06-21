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
      ? 'rgb(0, 0, 0)' 
      : 'rgb(255, 255, 255)'
    
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
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
      className="h-10 w-10 rounded-xl hover:bg-secondary/50 transition-all duration-200 hover:scale-105"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 