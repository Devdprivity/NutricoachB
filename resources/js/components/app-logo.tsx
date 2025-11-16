import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-transparent text-sidebar-primary-foreground transition-all duration-200">
                <AppLogoIcon className="size-6 fill-current text-black dark:text-white drop-shadow-sm" />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate text-lg leading-tight font-bold text-black dark:text-white">
                    gidia.app
                </span>
                <span className="text-xs text-black dark:text-white dark:opacity-70 font-medium">
                    Tu aliado fitness
                </span>
            </div>
        </>
    );
}
