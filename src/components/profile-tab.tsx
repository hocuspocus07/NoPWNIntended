import React, { useEffect, useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'

function ProfileTab() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        setName(user.user_metadata?.name || '')
        setEmail(user.email || '')
        setAvatarUrl(user.user_metadata?.avatar_url || '/avatars/01.png')
      }
    }
    fetchUser()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      const url = URL.createObjectURL(e.target.files[0])
      setAvatarUrl(url)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    let newAvatarUrl = avatarUrl
    try {
      // If a new avatar file is selected, upload it
      if (avatarFile) {
        const user = (await supabase.auth.getUser()).data.user
        if (!user) throw new Error('No user found')
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `avatars/${user.id}.${fileExt}`
        // Upload to Supabase Storage (bucket 'avatars' must exist)
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        // Get public URL
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
        newAvatarUrl = data.publicUrl
      }
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name, avatar_url: newAvatarUrl }
      })
      if (updateError) throw updateError
      setEditing(false)
      toast.success('Profile updated!')
      setAvatarFile(null)
      // Dispatch event
      window.dispatchEvent(new Event('profile-updated'))
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{name ? name.charAt(0) : 'U'}</AvatarFallback>
          </Avatar>
          {editing && (
            <Button
              type="button"
              size="sm"
              className="absolute bottom-0 right-0 rounded-full p-1"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Edit
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={!editing}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium">User Profile</h3>
          <p className="text-sm text-muted-foreground">
            Update your profile information
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={!editing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled />
          </div>
        </div>
        <div className="flex justify-end pt-4 gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>Cancel</Button>
              <Button variant="success" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileTab