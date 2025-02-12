"use client"

import { ethers } from "ethers";
import { useEffect } from "react";
import { Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useState } from "react"
import { CandidateCard } from "./components/candidate-card"
import { Rankings } from "./components/rankings"
import { WalletButton } from "./components/wallet-button"
import { Toaster } from "./components/error-toast";
import { toast } from "./components/ui/use-toast";
import { Spinner } from "./components/ui/spinner";
import process from "process";

// TODO: remove config for hardhat
// const PRIVATE_KEY =  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
// const HARDHAT_LOCAL_ADDR = "http://127.0.0.1:8545"

interface Candidate {
  id: number
  name: string
  voted: boolean
  votes: number
  rank: number
}

export default function VotingDapp() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [votingCardIdx, setVotingCardIdx] = useState<number | null>(null)
  const [isVotingEnabled, setIsVotingEnabled] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isTeacherOrDeployer, setIsTeacherOrDeployer] = useState<boolean>(false)
  const [isTogglingVoting, setIsTogglingVoting] = useState<boolean>(false)

  useEffect(() => {
    async function sync() {
      const [teacherAddress, deployerAddr, loggedUserAddr, votingState] = await Promise.all([
        getTeacherAddress(),
        getDeployerAddress(),
        getLoggedUserAddress(),
        getVotingState()
      ])

      if (teacherAddress === loggedUserAddr || deployerAddr === loggedUserAddr) {
        setIsTeacherOrDeployer(true)
      }

      setIsVotingEnabled(votingState)
    }

    sync()
  }, [])


  async function setupListener() {
    const signer = await connectWallet((res) => setIsWalletConnected(res));
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

  const handleToggleVoting = async () => {
    setIsTogglingVoting(true)

    if (isVotingEnabled) {
      await votingOff()
    } else {
      await votingOn()
    }

    const votingState = await getVotingState()
    setIsVotingEnabled(votingState)
    setIsTogglingVoting(false)

    toast({
      title: isVotingEnabled ? "Voting Disabled" : "Voting Enabled",
      description: isVotingEnabled ? "The voting system has been disabled" : "The voting system has been enabled",
      variant: isVotingEnabled ? "destructive" : "default",
    })
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

  const handleIssueToken = async (candidate: Candidate, amount: number) => {
    const { id: candidateId, name } = candidate
    const amountTuring = amount * 1e18

    try {
      issueToken(name, BigInt(amountTuring))
    } catch (ex) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error while issuing token, try again",
      })
      return
    }

    toast({
      title: "Turing",
      description: `Successfully issued token to ${name}`,
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
  }

  const handleVote = async (candidate: Candidate, amount: number, idx: number) => {
    const { id: candidateId, name } = candidate
    setVotingCardIdx(idx)

    if (amount > 2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot vote more than 2 Turing!",
      })
      return
    }

    const amountTuring = amount * 1e18

    try {
      await vote(name, BigInt(amountTuring))
      setVotingCardIdx(null)
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

    setVotingCardIdx(null)
  }

  if (!isWalletConnected) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster />

      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">DApp Voting System</h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {isTeacherOrDeployer && (
                <VotingStateButton
                  handleToggleVoting={handleToggleVoting}
                  isVotingEnabled={isVotingEnabled}
                  isTogglingVoting={isTogglingVoting}
                />
              )}
              <WalletButton />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {candidates.slice(0, 3).map((candidate, idx) => (
              <CandidateCard
                key={candidate.id}
                name={candidate.name}
                votes={candidate.votes}
                totalVotes={totalVotes}
                rank={candidate.rank}
                onVote={(amount) => handleVote(candidate, amount, idx)}
                isVoting={votingCardIdx == idx}
                enabled={!candidate.voted && isVotingEnabled}
                isTeacherOrDeployer={isTeacherOrDeployer}
                onIssueToken={(amount) => handleIssueToken(candidate, amount)}
                isWalletConnected={isWalletConnected}
              />
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold">Other Candidates</h2>
              <div className="grid gap-4">
                {candidates.slice(3).map((candidate, idx) => (
                  <CandidateCard
                    key={candidate.id}
                    name={candidate.name}
                    votes={candidate.votes}
                    totalVotes={totalVotes}
                    rank={candidate.rank}
                    enabled={!candidate.voted && isVotingEnabled}
                    onVote={(amount) => handleVote(candidate, amount, idx)}
                    isVoting={votingCardIdx == idx}
                    isWalletConnected={isWalletConnected}
                    isTeacherOrDeployer={isTeacherOrDeployer}
                    onIssueToken={(amount) => handleIssueToken(candidate, amount)}
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
  return new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string, json.abi, signer);
}

export async function connectWallet(setConnection?: (conn: boolean) => void) {
  if (!window.ethereum) {
    toast({
      variant: "destructive",
      title: "Cannot connect to metamask",
      description: "Please connect your wallet first",
    })

    if (setConnection)
      setConnection(false)

    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // TODO: remove, config for hardhat
    // const provider = new ethers.JsonRpcProvider(HARDHAT_LOCAL_ADDR);
    const signer = await provider.getSigner();

    if (setConnection)
      setConnection(true)

    return signer;
  } catch (error) {
    console.error("Wallet connection failed:", error);

    toast({
      variant: "destructive",
      title: "Error",
      description: "Cannot connect to wallet, try again",
    })

    if (setConnection)
      setConnection(false)

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

async function votingOff() {
  const signer = await connectWallet();
  if (!signer) return;
  const contract = await getContract(signer);

  const tx = await contract.votingOff();
  await tx.wait();
}

async function getTeacherAddress(): Promise<string> {
  const signer = await connectWallet();
  if (!signer) return ""
  const contract = await getContract(signer);

  return await contract.teacherAddress();
}

async function getDeployerAddress(): Promise<string> {
  const signer = await connectWallet();
  if (!signer) return ""
  const contract = await getContract(signer);

  return await contract.deployer();
}

async function getLoggedUserAddress(): Promise<string> {
  const signer = await connectWallet();
  if (!signer) return ""
  return signer.getAddress()
}

async function votingOn() {
  const signer = await connectWallet();
  if (!signer) return;
  const contract = await getContract(signer);

  const tx = await contract.votingOn();
  await tx.wait();
}

async function getVotingState() {
  const signer = await connectWallet();
  if (!signer) return;
  const contract = await getContract(signer);

  return contract.votingActive();
}

async function vote(name: string, amount: BigInt) {
  const signer = await connectWallet();
  if (!signer) return;
  const contract = await getContract(signer);

  const tx = await contract.vote(name, amount);
  await tx.wait();
}

async function issueToken(name: string, amount: BigInt) {
  const signer = await connectWallet();
  if (!signer) return;
  const contract = await getContract(signer);

  const tx = await contract.issueToken(name, amount);
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

type VotingStateButtonProps = {
  isVotingEnabled: boolean,
  handleToggleVoting: () => void,
  isTogglingVoting?: boolean
}

function VotingStateButton({ isVotingEnabled, handleToggleVoting, isTogglingVoting }: VotingStateButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={isVotingEnabled ? "outline" : "destructive"} className="gap-2">
          {isVotingEnabled ? (
            <>
              <Unlock className="h-4 w-4" />
              Voting Enabled
            </>
          ) : (
            <>
              {isTogglingVoting ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Voting Disabled
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isVotingEnabled ? "Disable Voting System?" : "Enable Voting System?"}</AlertDialogTitle>

          <AlertDialogDescription>
            {isVotingEnabled
              ? "This will prevent all users from submitting new votes. Existing votes will be preserved."
              : "This will allow users to submit votes again."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggleVoting}
            variant={isVotingEnabled ? "destructive" : "default"}
            disabled={isTogglingVoting}
          >
            {isTogglingVoting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                {isVotingEnabled ? "Disabling..." : "Enabling..."}
              </>
            ) : isVotingEnabled ? (
              "Disable Voting"
            ) : (
              "Enable Voting"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}