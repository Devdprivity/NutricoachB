import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-sidebar-primary-foreground shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 transition-all duration-200 hover:scale-105">
                <AppLogoIcon className="size-6 fill-current text-white drop-shadow-sm" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate text-lg leading-tight font-bold bg-gradient-to-r from-orange-600 to-orange-800 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                    NutiCoach
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    Tu aliado fitness
                </span>
            </div>
        </>
    );
}
