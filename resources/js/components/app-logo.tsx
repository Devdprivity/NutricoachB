import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-transparent text-sidebar-primary-foreground transition-all duration-200">
                <AppLogoIcon className="size-6 fill-current text-orange-600 dark:text-[#00FFD1] drop-shadow-sm" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate text-lg leading-tight font-bold bg-gradient-to-r from-orange-600 to-orange-800 dark:from-[#00FFD1] dark:to-[#00FFD1] dark:text-[#00FFD1] bg-clip-text text-transparent dark:bg-none">
                    NutiCoach
                </span>
                <span className="text-xs text-neutral-500 dark:text-[#00FFD1] dark:opacity-70 font-medium">
                    Tu aliado fitness
                </span>
            </div>
        </>
    );
}
