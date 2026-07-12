export type MypageSummary = {
  nickname: string
  profileImageUrl?: string | null
  availablePoint: number
  myReviewCount: number
}

export type MypageMenuAction =
  | {
      type: 'comingSoon'
    }
  | {
      type: 'navigate'
      path: string
    }
  | {
      type: 'external'
      url?: string
    }

export type MypageMenuItem = {
  id: string
  label: string
  count?: number
  action: MypageMenuAction
  highlighted?: boolean
}

export type MypageMenuSection = {
  id: string
  title: string
  items: MypageMenuItem[]
}
