"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function WalletButton() {
  const [address, setAddress] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        setAddress(accounts[0])
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
    setIsConnecting(false)
  }

  useEffect(() => {
    connectWallet()
  }, [])

  return (
    <Button
      variant={address ? "outline" : "default"}
      onClick={connectWallet}
      disabled={isConnecting}
      className="w-full sm:w-auto"
    >
      {isConnecting
        ? "Connecting..."
        : address
          ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connect Wallet"}
    </Button>
  )
}

