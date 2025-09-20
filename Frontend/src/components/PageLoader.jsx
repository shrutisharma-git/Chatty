import { LoaderIcon } from 'lucide-react'
import { useThemeStore } from '../hooks/useThemeStore'

const PageLoader = () => {
  const {theme} = useThemeStore();
  return (
    <div className='min-h-screen flex items-center justify-center' data-theme = {theme}>
        <LoaderIcon className='animate-ping size-20 text-primary'/>
    </div>
  )
}

export default PageLoader;
