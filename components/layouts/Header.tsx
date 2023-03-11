import { AppHeader } from "@/components/layouts/AppHeader"
import { HomeHeader } from "@/components/layouts/HomeHeader"

const HeaderComponent = ({
  home,
  docKey,
}: {
  home: boolean
  docKey: string
}) => {
  return (
    <>
      <header className="flex w-full justify-center">
        {home ? <HomeHeader /> : <AppHeader />}
      </header>
    </>
  )
}

export const Header = HeaderComponent
