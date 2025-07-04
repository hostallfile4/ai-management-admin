"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Plus,
  Trash2,
  Music,
  Upload,
  Download,
  Heart,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Song {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  isFavorite: boolean
}

interface Playlist {
  id: string
  name: string
  songs: Song[]
  createdAt: Date
}

export function MP3Playlist() {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: "1",
      name: "আমার প্রিয় গান",
      songs: [
        {
          id: "1",
          title: "একুশের গান",
          artist: "আব্দুল গাফফার চৌধুরী",
          duration: 240,
          url: "",
          isFavorite: true,
        },
        {
          id: "2",
          title: "আমার সোনার বাংলা",
          artist: "রবীন্দ্রনাথ ঠাকুর",
          duration: 180,
          url: "",
          isFavorite: false,
        },
      ],
      createdAt: new Date(),
    },
  ])

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(playlists[0] || null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none")
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update current time
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    audio.addEventListener("timeupdate", updateTime)
    return () => audio.removeEventListener("timeupdate", updateTime)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    // In a real app, you would set the audio source here
    // audioRef.current.src = song.url
  }

  const togglePlayPause = () => {
    if (!currentSong) return

    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }

  const playNext = () => {
    if (!selectedPlaylist || !currentSong) return

    const currentIndex = selectedPlaylist.songs.findIndex((s) => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % selectedPlaylist.songs.length
    playSong(selectedPlaylist.songs[nextIndex])
  }

  const playPrevious = () => {
    if (!selectedPlaylist || !currentSong) return

    const currentIndex = selectedPlaylist.songs.findIndex((s) => s.id === currentSong.id)
    const prevIndex = currentIndex === 0 ? selectedPlaylist.songs.length - 1 : currentIndex - 1
    playSong(selectedPlaylist.songs[prevIndex])
  }

  const toggleFavorite = (songId: string) => {
    if (!selectedPlaylist) return

    const updatedSongs = selectedPlaylist.songs.map((song) =>
      song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song,
    )

    const updatedPlaylist = { ...selectedPlaylist, songs: updatedSongs }
    setSelectedPlaylist(updatedPlaylist)
    setPlaylists((prev) => prev.map((p) => (p.id === selectedPlaylist.id ? updatedPlaylist : p)))

    if (currentSong?.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null))
    }
  }

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "ত্রুটি!",
        description: "প্লেলিস্টের নাম দিন।",
        variant: "destructive",
      })
      return
    }

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      songs: [],
      createdAt: new Date(),
    }

    setPlaylists((prev) => [...prev, newPlaylist])
    setSelectedPlaylist(newPlaylist)
    setNewPlaylistName("")
    setShowCreatePlaylist(false)

    toast({
      title: "প্লেলিস্ট তৈরি হয়েছে! ✅",
      description: `"${newPlaylist.name}" সফলভাবে তৈরি হয়েছে।`,
    })
  }

  const addSongToPlaylist = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selectedPlaylist) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("audio/")) {
        const newSong: Song = {
          id: Date.now().toString() + Math.random(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "অজানা শিল্পী",
          duration: 0, // Would be determined after loading
          url: URL.createObjectURL(file),
          isFavorite: false,
        }

        const updatedPlaylist = {
          ...selectedPlaylist,
          songs: [...selectedPlaylist.songs, newSong],
        }

        setSelectedPlaylist(updatedPlaylist)
        setPlaylists((prev) => prev.map((p) => (p.id === selectedPlaylist.id ? updatedPlaylist : p)))
      }
    })

    toast({
      title: "গান যোগ হয়েছে! 🎵",
      description: "নতুন গান প্লেলিস্টে যোগ করা হয়েছে।",
    })
  }

  const removeSong = (songId: string) => {
    if (!selectedPlaylist) return

    const updatedSongs = selectedPlaylist.songs.filter((song) => song.id !== songId)
    const updatedPlaylist = { ...selectedPlaylist, songs: updatedSongs }

    setSelectedPlaylist(updatedPlaylist)
    setPlaylists((prev) => prev.map((p) => (p.id === selectedPlaylist.id ? updatedPlaylist : p)))

    if (currentSong?.id === songId) {
      setCurrentSong(null)
      setIsPlaying(false)
    }

    toast({
      title: "গান মুছে ফেলা হয়েছে! 🗑️",
      description: "গান প্লেলিস্ট থেকে সরানো হয়েছে।",
    })
  }

  const exportPlaylist = (playlist: Playlist) => {
    const dataStr = JSON.stringify(playlist, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${playlist.name}-playlist.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "প্লেলিস্ট এক্সপোর্ট হয়েছে! 📥",
      description: `"${playlist.name}" ডাউনলোড হয়েছে।`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">MP3 প্লেলিস্ট</h2>
          <p className="text-gray-600">আপনার প্রিয় গানের প্লেলিস্ট তৈরি এবং পরিচালনা করুন</p>
        </div>
        <Button onClick={() => setShowCreatePlaylist(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          নতুন প্লেলিস্ট
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Playlist Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              প্লেলিস্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPlaylist?.id === playlist.id
                      ? "bg-blue-100 border-2 border-blue-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="font-medium text-sm">{playlist.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{playlist.songs.length} গান</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Music Player */}
          {currentSong && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{currentSong.title}</h3>
                    <p className="text-gray-600">{currentSong.artist}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFavorite(currentSong.id)}
                    className={currentSong.isFavorite ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${currentSong.isFavorite ? "fill-current" : ""}`} />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <Progress value={(currentTime / currentSong.duration) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentSong.duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button variant="outline" size="sm" onClick={() => setIsShuffled(!isShuffled)}>
                    <Shuffle className={`h-4 w-4 ${isShuffled ? "text-blue-600" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={playPrevious}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button onClick={togglePlayPause} className="w-12 h-12 rounded-full">
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={playNext}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRepeatMode(repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none")}
                  >
                    <Repeat className={`h-4 w-4 ${repeatMode !== "none" ? "text-blue-600" : ""}`} />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500 w-8">{isMuted ? 0 : volume}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Song List */}
          {selectedPlaylist && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    {selectedPlaylist.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addSongToPlaylist}>
                      <Upload className="h-4 w-4 mr-1" />
                      গান যোগ করুন
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportPlaylist(selectedPlaylist)}>
                      <Download className="h-4 w-4 mr-1" />
                      এক্সপোর্ট
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedPlaylist.songs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPlaylist.songs.map((song, index) => (
                      <div
                        key={song.id}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer ${
                          currentSong?.id === song.id ? "bg-blue-50 border border-blue-200" : ""
                        }`}
                        onClick={() => playSong(song)}
                      >
                        <div className="w-8 text-center text-sm text-gray-500">{index + 1}</div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                          <Music className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{song.title}</div>
                          <div className="text-sm text-gray-600">{song.artist}</div>
                        </div>
                        <div className="text-sm text-gray-500">{formatTime(song.duration)}</div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(song.id)
                            }}
                            className={song.isFavorite ? "text-red-500" : ""}
                          >
                            <Heart className={`h-3 w-3 ${song.isFavorite ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSong(song.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">কোন গান নেই</h3>
                    <p className="mb-4">এই প্লেলিস্টে গান যোগ করুন</p>
                    <Button onClick={addSongToPlaylist}>
                      <Upload className="h-4 w-4 mr-2" />
                      প্রথম গান যোগ করুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>নতুন প্লেলিস্ট তৈরি করুন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="প্লেলিস্টের নাম"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreatePlaylist(false)}>
                  বাতিল
                </Button>
                <Button onClick={createPlaylist}>তৈরি করুন</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="audio/*" multiple onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
