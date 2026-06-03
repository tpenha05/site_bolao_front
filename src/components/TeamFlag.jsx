import { useState } from 'react'

const sizeMap = {
  sm: { img: 'w-8 h-6', text: 'text-xs', name: 'text-xs max-w-[72px]' },
  md: { img: 'w-12 h-8', text: 'text-sm', name: 'text-sm max-w-[88px]' },
  lg: { img: 'w-20 h-14', text: 'text-base', name: 'text-sm max-w-[110px]' },
}

export default function TeamFlag({ team, size = 'md' }) {
  const [imgError, setImgError] = useState(false)
  const s = sizeMap[size] || sizeMap.md

  if (!team) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className={`${s.img} bg-gray-100 rounded border border-gray-200 flex items-center justify-center`}>
          <span className="text-gray-300 text-xs">?</span>
        </div>
        <span className={`${s.name} text-gray-400 text-center leading-tight truncate`}>A definir</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {team.flag && !imgError ? (
        <img
          src={team.flag}
          alt={team.name_en}
          className={`${s.img} object-cover rounded shadow-sm border border-gray-100`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`${s.img} bg-gray-100 rounded border border-gray-200 flex items-center justify-center`}>
          <span className="text-gray-500 font-bold text-xs">
            {team.fifa_code || team.name_en?.slice(0, 3).toUpperCase()}
          </span>
        </div>
      )}
      <span className={`${s.name} text-gray-700 font-medium text-center leading-tight truncate`}>
        {team.name_en}
      </span>
    </div>
  )
}
