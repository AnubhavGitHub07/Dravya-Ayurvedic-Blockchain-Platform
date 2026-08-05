import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserAvatar() {
  return (
    <Avatar>
      <AvatarImage src="" alt="User Avatar" />
      <AvatarFallback>AD</AvatarFallback>
    </Avatar>
  )
}
