import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Crown, Medal, Trophy } from "lucide-react"

interface Candidate {
  id: number
  name: string
  votes: number
  rank: number
}

interface RankingsProps {
  candidates: Candidate[]
}

export function Rankings({ candidates }: RankingsProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 2:
        return <Trophy className="w-4 h-4 text-gray-400" />
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />
      default:
        return null
    }
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Votes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {getRankIcon(candidate.rank)}
                  {candidate.rank}
                </div>
              </TableCell>
              <TableCell>{candidate.name}</TableCell>
              <TableCell className="text-right">{candidate.votes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

