import { useEffect, useState } from 'react';
import { Client, Account } from 'appwrite';

// Initialize Appwrite
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('67fe9627001d97e37ef3'); // Project ID from config

const account = new Account(client);

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const session = await account.get();
            setUser(session);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        const domain = process.env.NEXT_PUBLIC_DOMAIN || 'whisperrnote.space';
        const authSubdomain = process.env.NEXT_PUBLIC_AUTH_SUBDOMAIN || 'accounts';
        const currentUri = window.location.href;
        
        // Construct IDMS URL
        const idmsUrl = `https://${authSubdomain}.${domain}?source=${encodeURIComponent(currentUri)}`;
        
        // For Desktop: Open overlay/popup (simulated here as new window for simplicity, 
        // but in a real desktop app this might be an IPC call or iframe)
        // The prompt says "window overlay opens (in desktop)".
        // Since this is a web app running in browser, we can use a popup or redirect.
        // Prompt says "it doesn't open a window in mobile... instead it just navigates".
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            window.location.href = idmsUrl;
        } else {
            // Desktop: Open popup
            const width = 500;
            const height = 600;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            
            const popup = window.open(
                idmsUrl,
                'WhisperrAuth',
                `width=${width},height=${height},top=${top},left=${left}`
            );

            // Listen for session completion
            // In a real scenario, the IDMS would postMessage back or we poll for session
            const interval = setInterval(async () => {
                try {
                    const session = await account.get();
                    if (session) {
                        setUser(session);
                        clearInterval(interval);
                        popup?.close();
                    }
                } catch (e) {
                    // No session yet
                }
            }, 1000);
        }
    };

    return { user, loading, login };
}
