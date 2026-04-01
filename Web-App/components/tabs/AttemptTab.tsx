"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { attemptsApi, type Attempt, type AttemptUpdate } from "@/lib/api/attempts"
import { challengesApi, type Challenge } from "@/lib/api/challenges"
import { teamsApi, type Team } from "@/lib/api/teams"
import { driversApi, type Driver } from "@/lib/api/drivers"
import { toast } from "sonner"

export default function AttemptsTab() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAttempt, setEditingAttempt] = useState<Attempt | null>(null)
  const [attemptToDelete, setAttemptToDelete] = useState<number | null>(null)

  const [formData, setFormData] = useState<AttemptUpdate>({
    start_time: undefined,
    end_time: undefined,
    energy_used: undefined,
    is_valid: undefined,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedChallenge) {
      loadAttempts()
    }
  }, [selectedChallenge])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [challengesData, teamsData, driversData] = await Promise.all([
        challengesApi.listChallenges(),
        teamsApi.listTeams(),
        driversApi.listDrivers(),
      ])
      setChallenges(challengesData)
      setTeams(teamsData)
      setDrivers(driversData)
      
      if (challengesData.length > 0 && !selectedChallenge) {
        setSelectedChallenge(challengesData[0].id)
      }
    } catch (error: any) {
    } finally {
      setIsLoading(false)
    }
  }

  const loadAttempts = async () => {
    if (!selectedChallenge) return

    setIsLoading(true)
    try {
      const data = await attemptsApi.getAttemptsForChallenge(selectedChallenge)
      setAttempts(data)
    } catch (error: any) {
      setAttempts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAttempt = async () => {
    if (!editingAttempt) return

    setIsLoading(true)
    try {
      await attemptsApi.updateAttempt(editingAttempt.id, formData)
      toast.success("Attempt updated successfully")
      setIsEditDialogOpen(false)
      setEditingAttempt(null)
      loadAttempts()
    } catch (error: any) {
      toast.error(error.message || "Failed to update attempt")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAttempt = (id: number) => {
    setAttemptToDelete(id)
  }

  const confirmDeleteAttempt = async () => {
    if (attemptToDelete === null) return
    setIsLoading(true)
    try {
      await attemptsApi.deleteAttempt(attemptToDelete)
      toast.success("Attempt deleted successfully")
      loadAttempts()
      setAttemptToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete attempt")
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (attempt: Attempt) => {
    setEditingAttempt(attempt)
    setFormData({
      start_time: attempt.start_time,
      end_time: attempt.end_time,
      energy_used: attempt.energy_used,
      is_valid: attempt.is_valid,
    })
    setIsEditDialogOpen(true)
  }

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.name || `Team #${teamId}`
  }

  const getDriverName = (driverId: number) => {
    return drivers.find(d => d.id === driverId)?.name || `Driver #${driverId}`
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()
    const seconds = durationMs / 1000
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = (seconds % 60).toFixed(3)
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Attempts Management</h2>
        <Select
          value={selectedChallenge?.toString()}
          onValueChange={(value) => setSelectedChallenge(parseInt(value))}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select challenge" />
          </SelectTrigger>
          <SelectContent>
            {challenges.map((challenge) => (
              <SelectItem key={challenge.id} value={challenge.id.toString()}>
                {challenge.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Attempts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Energy Used</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Valid</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No attempts found for this challenge.
                    </TableCell>
                  </TableRow>
                )}
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">{getTeamName(attempt.team_id)}</TableCell>
                    <TableCell>{getDriverName(attempt.driver_id)}</TableCell>
                    <TableCell className="font-mono">
                      {calculateDuration(attempt.start_time, attempt.end_time)}
                    </TableCell>
                    <TableCell>{attempt.energy_used.toFixed(2)} Wh</TableCell>
                    <TableCell className="text-sm">{formatDateTime(attempt.start_time)}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(attempt.end_time)}</TableCell>
                    <TableCell>
                      {attempt.is_valid ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Invalid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(attempt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttempt(attempt.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Attempt</DialogTitle>
          </DialogHeader>
          {editingAttempt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-muted-foreground">Team</Label>
                  <p className="font-medium">{getTeamName(editingAttempt.team_id)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Driver</Label>
                  <p className="font-medium">{getDriverName(editingAttempt.driver_id)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: new Date(e.target.value).toISOString() })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time ? new Date(formData.end_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: new Date(e.target.value).toISOString() })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="energy_used">Energy Used (Wh)</Label>
                <Input
                  id="energy_used"
                  type="number"
                  step="0.01"
                  value={formData.energy_used || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, energy_used: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="is_valid">Validity Status</Label>
                <Select
                  value={formData.is_valid?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, is_valid: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">✓ Valid</SelectItem>
                    <SelectItem value="false">✗ Invalid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAttempt} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Attempt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={attemptToDelete !== null}
        onOpenChange={() => setAttemptToDelete(null)}
        title="Delete Attempt"
        description="Are you sure you want to delete this attempt?"
        confirmLabel="Delete"
        destructive
        loading={isLoading}
        onConfirm={confirmDeleteAttempt}
      />
    </div>
  )
}
