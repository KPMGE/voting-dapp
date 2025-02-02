"use client"

import { ethers } from "ethers";
import { useEffect } from "react";

import { useState } from "react"
import { CandidateCard } from "./components/candidate-card"
import { Rankings } from "./components/rankings"
import { WalletButton } from "./components/wallet-button"
import { Toaster } from "./components/error-toast";
import { toast } from "./components/ui/use-toast";

const CONTRACT_ADDRESS = "0x29C84aBE989585E14D8150350c7a9B055bD10bFA";

interface Candidate {
  id: number
  name: string
  voted: boolean
  votes: number
  rank: number
}

export default function VotingDapp() {
  const [isWalletConnected, setIsWalletConnected] = useState(true)
  const [votingId, setVotingId] = useState<number | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])

  async function setupListener() {
    const signer = await connectWallet();
    if (!signer) return;
    const contract = await getContract(signer);
    console.log("Listening to vote events...");

    contract.on("OnVote", async (name: string, amount: bigint) => {
      let allCandidates = await getAllCandidates()
      const pastVotes = await getPastVotes()
      if (!pastVotes) return

      const voteMap = pastVotes.reduce<Record<string, number>>((acc, vote) => {
        const convertedAmount = parseFloat(ethers.formatEther(String(vote.amount)));
        acc[vote.name] = (acc[vote.name] || 0) + convertedAmount;
        return acc;
      }, {});

      const updatedCandidates = allCandidates
        .map((c: Candidate) => ({
          ...c,
          votes: voteMap[c.name] || 0,
          voted: voteMap[c.name] > 0,
        }))
        .sort((a: Candidate, b: Candidate) => b.votes - a.votes)
        .map((c: Candidate, index: number) => ({ ...c, rank: index + 1 }));

      setCandidates(updatedCandidates)
    });
  }

  useEffect(() => {
    async function handleCandidates() {
      let allCandidates = await getAllCandidates()
      const pastVotes = await getPastVotes()
      if (!pastVotes) return

      const voteMap = pastVotes.reduce<Record<string, number>>((acc, vote) => {
        const convertedAmount = parseFloat(ethers.formatEther(String(vote.amount)));
        acc[vote.name] = (acc[vote.name] || 0) + convertedAmount;
        return acc;
      }, {});

      const updatedCandidates = allCandidates
        .map((c: Candidate) => ({
          ...c,
          votes: voteMap[c.name] || 0,
          voted: voteMap[c.name] > 0,
        }))
        .sort((a: Candidate, b: Candidate) => b.votes - a.votes)
        .map((c: Candidate, index: number) => ({ ...c, rank: index + 1 }));

      setCandidates(updatedCandidates)
    }

    handleCandidates()
      .then(() => setupListener())
      .catch((e) => console.error("could not get the candidates: ", e))
  }, [])

  const totalVotes = candidates?.reduce((sum, candidate) => sum + candidate.votes, 0) ?? 0

  const handleVote = async (candidate: Candidate, amount: number) => {
    const { id: candidateId, name } = candidate

    if (amount > 2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot vote more than 2 Turing!",
      })
      return
    }

    const amountTuring = amount * 1e18
    setVotingId(candidateId)

    try {
      vote(name, BigInt(amountTuring))
    } catch (ex) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error while voting, try again",
      })
      return
    }

    toast({
      title: "Turing",
      description: `Successfully voted on ${name}`,
    })

    setCandidates((prev) =>
      prev
        .map((c) => {
          if (c.id === candidateId) {
            const convertedAmount = parseFloat(ethers.formatEther(String(amountTuring)))
            return { ...c, votes: c.votes + convertedAmount, voted: true }
          }
          return c
        })
        .sort((a, b) => b.votes - a.votes)
        .map((c, index) => ({ ...c, rank: index + 1 })),
    )
    setVotingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster />

      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">DApp Voting System</h1>
            <WalletButton />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {candidates.slice(0, 3).map((candidate) => (
              <CandidateCard
                key={candidate.id}
                name={candidate.name}
                votes={candidate.votes}
                totalVotes={totalVotes}
                rank={candidate.rank}
                onVote={(amount) => handleVote(candidate, amount)}
                isVoting={votingId === candidate.id}
                voted={candidate.voted}
                isWalletConnected={isWalletConnected}
              />
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold">Other Candidates</h2>
              <div className="grid gap-4">
                {candidates.slice(3).map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    name={candidate.name}
                    votes={candidate.votes}
                    totalVotes={totalVotes}
                    rank={candidate.rank}
                    voted={candidate.voted}
                    onVote={(amount) => handleVote(candidate, amount)}
                    isVoting={votingId === candidate.id}
                    isWalletConnected={isWalletConnected}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold">Current Rankings</h2>
              <Rankings candidates={candidates} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getContract(signer: ethers.Signer) {
  const res = await fetch("/abi/Turing.json");
  const json = await res.json();
  return new ethers.Contract(CONTRACT_ADDRESS, json.abi, signer);
}
export async function connectWallet() {
  if (window.ethereum == 'undefined') {
    toast({
      variant: "destructive",
      title: "Cannot connect to metamask",
      description: "Please connect your wallet first",
    })
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // TODO: remove, config for hardhat
   // const provider = new ethers.JsonRpcProvider(HARDHAT_LOCAL_ADDR);
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error("Wallet connection failed:", error);

    toast({
      variant: "destructive",
      title: "Error",
      description: "Cannot connect to wallet, try again",
    })
    return null;
  }
}

async function getPastVotes() {
  const signer = await connectWallet();
  if (!signer) return;
  const contract = await getContract(signer);



  const filter = contract.filters.OnVote();
  const events = await contract.queryFilter(filter);

  const votes = events.map((event: any) => ({
    name: event.args?.[0],
    amount: event.args?.[1]?.toString() ?? 0
  }));

  return votes;
}


async function vote(name: string, amount: BigInt) {
  const signer = await connectWallet();
  if (!signer) return;
  const contract = await getContract(signer);

  const tx = await contract.vote(name, amount);
  await tx.wait();
}


async function getAllCandidates() {
  const signer = await connectWallet();
  if (!signer) return [];
  const contract = await getContract(signer);

  const candidates = await contract.getAllAuthorizedUsers();
  const candidateName = await contract.getLoggedUser();

  const mapped = candidates.map((candidate: string, idx: number) => ({
    id: idx,
    name: candidate,
    votes: 0,
    rank: idx + 1,
    voted: candidate === candidateName
  }))

  return mapped
}