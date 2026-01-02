interface ProfileAboutProps {
  user: {
    bio?: string
    location?: string
    website?: string
  }
}

export function ProfileAbout({ user }: ProfileAboutProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">About</h2>
      {user.bio ? (
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
        </div>
      ) : (
        <p className="text-gray-500 italic">No bio available</p>
      )}
    </div>
  )
}
