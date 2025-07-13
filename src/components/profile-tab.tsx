import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function ProfileTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/avatars/01.png" />
          <AvatarFallback>US</AvatarFallback>
        </Avatar>
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
            <Input id="name" defaultValue="Security User" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="user@nopwnintended.com" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Input id="bio" defaultValue="Security Researcher" />
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="success">Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileTab